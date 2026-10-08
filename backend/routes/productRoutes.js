const router = require('express').Router();
const c = require('../controllers/productController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public
router.get('/', c.getProducts);
router.get('/categories', c.getCategories); // must be BEFORE '/:id'
router.get('/:id', c.getProduct);

// Admin only
router.post('/', protect, admin, c.createProduct);
router.put('/:id', protect, admin, c.updateProduct);
router.delete('/:id', protect, admin, c.deleteProduct);

module.exports = router;
