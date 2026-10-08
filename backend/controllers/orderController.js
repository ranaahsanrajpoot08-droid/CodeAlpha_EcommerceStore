const Order = require('../models/orderModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, isNonEmpty, isPhone } = require('../utils/validators');

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// POST /api/orders  (logged-in user)
// Body: { items: [{ productId, quantity }], shipping: { name, email, phone, address, city, postalCode } }
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shipping } = req.body;

  if (!Array.isArray(items) || items.length === 0) throw new AppError('Your cart is empty.', 400);
  if (!shipping) throw new AppError('Shipping information is required.', 400);

  const { name, email, phone, address, city, postalCode } = shipping;
  if (!isNonEmpty(name)) throw new AppError('Name is required.', 400);
  if (!isEmail(email)) throw new AppError('A valid email is required.', 400);
  if (!isPhone(phone)) throw new AppError('A valid phone number is required.', 400);
  if (!isNonEmpty(address)) throw new AppError('Address is required.', 400);
  if (!isNonEmpty(city)) throw new AppError('City is required.', 400);
  if (!isNonEmpty(postalCode)) throw new AppError('Postal code is required.', 400);

  const orderId = await Order.create(req.user.id, items, {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address.trim(),
    city: city.trim(),
    postalCode: postalCode.trim(),
  });

  res.status(201).json({ order: await Order.findById(orderId) });
});

// GET /api/orders/my-orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  res.json({ orders: await Order.findByUser(req.user.id) });
});

// GET /api/orders/:id  (owner or admin)
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You are not allowed to view this order.', 403);
  }
  res.json({ order });
});

// GET /api/admin/orders?status=Pending  (admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : null;
  res.json({ orders: await Order.findAll(status) });
});

// PUT /api/admin/orders/:id/status  (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new AppError(`Status must be one of: ${STATUSES.join(', ')}`, 400);
  await Order.updateStatus(req.params.id, status);
  res.json({ order: await Order.findById(req.params.id) });
});
