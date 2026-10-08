const router = require('express').Router();
const c = require('../controllers/orderController');
const protect = require('../middleware/authMiddleware');

router.use(protect); // every order route needs a logged-in user

router.post('/', c.createOrder);
router.get('/my-orders', c.getMyOrders); // must be BEFORE '/:id'
router.get('/:id', c.getOrder);

module.exports = router;
