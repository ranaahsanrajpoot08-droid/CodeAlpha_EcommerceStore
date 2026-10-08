const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isNonEmpty } = require('../utils/validators');

// Validates product input and returns clean values (used by create + update)
const cleanProduct = (body) => {
  const { name, description, price, image, category, stock } = body;
  const p = Number(price);
  const s = Number(stock);

  if (!isNonEmpty(name)) throw new AppError('Product name is required.', 400);
  if (!isNonEmpty(category)) throw new AppError('Category is required.', 400);
  if (!Number.isFinite(p) || p < 0) throw new AppError('Price must be a number 0 or higher.', 400);
  if (!Number.isInteger(s) || s < 0) throw new AppError('Stock must be a whole number 0 or higher.', 400);

  return {
    name: name.trim(),
    description: (description || '').trim(),
    price: Math.round(p * 100) / 100,
    image: (image || '').trim(),
    category: category.trim(),
    stock: s,
  };
};

// GET /api/products?search=&category=&sort=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.getAll(req.query);
  res.json({ products });
});

// GET /api/products/categories
exports.getCategories = asyncHandler(async (req, res) => {
  res.json({ categories: await Product.getCategories() });
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found.', 404);
  res.json({ product });
});

// POST /api/products  (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const id = await Product.create(cleanProduct(req.body));
  res.status(201).json({ product: await Product.findById(id) });
});

// PUT /api/products/:id  (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) throw new AppError('Product not found.', 404);
  await Product.update(req.params.id, cleanProduct(req.body));
  res.json({ product: await Product.findById(req.params.id) });
});

// DELETE /api/products/:id  (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const removed = await Product.remove(req.params.id);
  if (!removed) throw new AppError('Product not found.', 404);
  res.json({ message: 'Product deleted.' });
});
