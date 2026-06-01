const Product = require('../models/Product');

// @desc  Get all products
// @route GET /api/products
// @access Private
const getProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, lowStock } = req.query;
    const filter = {};

    if (category) filter.categoryId = category;
    if (supplier) filter.supplierId = supplier;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (lowStock) filter.stock = { $lte: Number(lowStock) };

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc  Get product by ID
// @route GET /api/products/:id
// @access Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc  Create product
// @route POST /api/products
// @access Private (admin, manager)
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, price, stock, categoryId, supplierId } = req.body;
    const product = await Product.create({ name, sku, price, stock, categoryId, supplierId });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc  Update product
// @route PUT /api/products/:id
// @access Private (admin, manager)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const { name, sku, price, stock, categoryId, supplierId, isActive } = req.body;
    product.name = name ?? product.name;
    product.sku = sku ?? product.sku;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.categoryId = categoryId ?? product.categoryId;
    product.supplierId = supplierId ?? product.supplierId;
    product.isActive = isActive ?? product.isActive;
    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Private (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
