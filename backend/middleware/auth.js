const jwt = require('jsonwebtoken');
const User = require('../models/User');

// التحقق من التوكن وإرفاق المستخدم بالطلب
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'غير مصرح لك، يرجى تسجيل الدخول.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'هذا الحساب معطل.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * 🆕 ميدل وير فحص الصلاحيات (Permissions)
 * يسمح بالمرور إذا كان المستخدم:
 * 1. "owner" أو الرتبة المخفية "hidden" (وصول كامل)
 * 2. يمتلك الصلاحية المحددة في مصفوفة permissions الخاصة به
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول أولاً.' });
    }

    // الأونر والرتبة المخفية (النجمة) لديهم صلاحية مطلقة لكل شيء
    if (req.user.role === 'owner' || req.user.role === 'hidden') {
      return next();
    }

    // التحقق من وجود الصلاحية المحددة في مصفوفة صلاحيات المستخدم
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'ليس لديك الصلاحية الكافية للقيام بهذا الإجراء.'
    });
  };
};

/**
 * تحديث نظام الـ Authorize ليدعم الرتبة المخفية
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'غير مصرح.' });

    // الرتبة المخفية (hidden) تعامل برتبة أعلى من الأونر في الحسابات
    const roleHierarchy = { 
        user: 0, 
        editor: 1, 
        admin: 2, 
        manager: 3, 
        'co-owner': 4, 
        owner: 5, 
        hidden: 6 // الرتبة المخفية
    };

    const userLevel = roleHierarchy[req.user.role] ?? -1;
    const requiredLevel = Math.min(...roles.map(r => roleHierarchy[r] ?? 99));

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: 'تم رفض الوصول.'
      });
    }

    next();
  };
};