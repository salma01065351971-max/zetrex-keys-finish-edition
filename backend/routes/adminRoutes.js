const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController'); // أنتِ هنا سميتِ الملف ctrl

// حماية جميع المسارات التالية: يجب أن يكون مسجلاً للدخول وبرتبة أدمن
router.use(protect, authorize('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/users', ctrl.getUsers);

// تعديل الأسماء هنا لتطابق المتغير ctrl 👇
router.put('/settings', ctrl.updateSettings);
router.get('/financials', ctrl.getFinancialReports);

module.exports = router;