const Notification = require('../models/Notification');

// جلب إشعارات المستخدم الحالي
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// تعيين إشعار واحد كمقروء
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// تعيين كل الإشعارات كمقروءة
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// حذف إشعار
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// حذف كل الإشعارات
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Helper: إنشاء إشعار (تُستخدم داخلياً من orderController)
exports.createNotification = async (userId, { type, title, message, metadata, actionUrl }) => {
  return await Notification.create({ user: userId, type, title, message, metadata, actionUrl });
};