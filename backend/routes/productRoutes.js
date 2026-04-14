const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', ctrl.getProducts);
router.get('/categories/stats', ctrl.getCategoryStats);
router.get('/:id', ctrl.getProduct);

// إنشاء منتج جديد مع صورة
router.post('/', protect, authorize('editor'), upload.single('image'), ctrl.createProduct);

// تحديث منتج مع صورة
router.put('/:id', protect, authorize('editor'), upload.single('image'), ctrl.updateProduct);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProduct);
router.post('/:id/reviews', protect, ctrl.addReview);

module.exports = router;
