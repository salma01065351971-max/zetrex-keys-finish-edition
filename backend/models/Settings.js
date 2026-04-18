const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  siteName: {
    type: String,
    default: 'Digivault'
  },
  // ── إعدادات الإشعارات بالإيميل ────────────────────────────────────────────
  emailNotifications: {
    orderConfirmation: { type: Boolean, default: true },  // إيميل تأكيد الأوردر للعميل
    welcomeEmail:      { type: Boolean, default: true },  // إيميل الترحيب بالمستخدم الجديد
    lowStockAlert:     { type: Boolean, default: true },  // تنبيه الأدمن عند نقص المخزون
    adminNewOrder:     { type: Boolean, default: false }, // إيميل للأدمن عند كل أوردر جديد
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);