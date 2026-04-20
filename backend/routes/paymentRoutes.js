const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');
const paypalCtrl = require('../controllers/paypalController');
router.post('/paypal/create', protect, paypalCtrl.createPayPalOrder);
router.post('/paypal/capture', protect, paypalCtrl.capturePayPalOrder);
router.get('/config', ctrl.getConfig);
router.post('/create-payment-intent', protect, ctrl.createPaymentIntent);
router.post('/confirm/:orderId', protect, authorize('admin'), ctrl.confirmPayment);
router.post('/webhook', ctrl.stripeWebhook); // raw body applied in server.js

module.exports = router;
