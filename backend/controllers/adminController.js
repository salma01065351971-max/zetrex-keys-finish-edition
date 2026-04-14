const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DigitalCode = require('../models/DigitalCode');

// ملاحظة: يُفضل وجود موديل للإعدادات العامة، وإلا سنفترض وجود متغير أو حفظه في قاعدة البيانات
// لنفترض أننا سنستخدم موديل افتراضي للإعدادات (Settings)
// const Settings = require('../models/Settings');

// @GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    // جلب حالة وضع الصيانة (نفترض أنها مخزنة في موديل Settings)
    // const settings = await Settings.findOne(); 

    const [
      totalUsers, totalProducts, totalOrders,
      revenueData, recentOrders, lowStockProducts,
      ordersByStatus, monthlySales
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: { $in: ['paid', 'completed', 'paid_unconfirmed'] } }),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find() // جلب أحدث الطلبات حتى التي تحتاج تأكيد
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(8),
      Product.find({ isActive: true, stock: { $lte: 5 } })
        .sort({ stock: 1 })
        .limit(10)
        .select('name stock category'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['paid', 'completed'] },
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData[0]?.total || 0,
        recentOrders,
        lowStockProducts,
        ordersByStatus: Object.fromEntries(ordersByStatus.map(s => [s._id, s.count])),
        monthlySales,
        // maintenanceMode: settings?.maintenanceMode || false // إرسال حالة الصيانة للفرونت
      }
    });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/admin/settings
// 🆕 دالة تحديث وضع الصيانة وإعدادات الموقع
exports.updateSettings = async (req, res, next) => {
  try {
    const { maintenanceMode } = req.body;
    
    // هنا تقوم بتحديث الحالة في قاعدة البيانات
    // مثال: await Settings.findOneAndUpdate({}, { maintenanceMode }, { upsert: true });

    res.json({ 
      success: true, 
      message: `تم ${maintenanceMode ? 'تفعيل' : 'إلغاء'} وضع الصيانة بنجاح`,
      maintenanceMode 
    });
  } catch (err) {
    next(err);
  }
};

// @GET /api/admin/financials
// 🆕 دالة جلب البيانات المالية المفصلة
exports.getFinancialReports = async (req, res, next) => {
  try {
    const { range = '30' } = req.query; // الافتراضي آخر 30 يوم
    const startDate = new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000);

    const financials = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ success: true, financials });
  } catch (err) {
    next(err);
  }
};

// @GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');

    res.json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (role === 'owner' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only owners can assign owner role' });
    }
    if (targetUser.role === 'owner' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Cannot change owner role' });
    }

    targetUser.role = role;
    await targetUser.save();
    res.json({ success: true, user: targetUser });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'owner') return res.status(403).json({ success: false, message: 'Cannot deactivate owner' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
};