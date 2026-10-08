const router = require('express').Router();
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getAllUsers } = require('../controllers/userController');
const { getStats } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(protect, admin); // everything below is admin only

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);

module.exports = router;
