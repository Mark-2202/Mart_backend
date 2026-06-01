const Category = require('../models/Category');

// @desc  Get all categories
// @route GET /api/categories
// @access Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('userid', 'name');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc  Get category by ID
// @route GET /api/categories/:id
// @access Private
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('userid', 'name');
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// @desc  Create category
// @route POST /api/categories
// @access Private (admin, manager)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description, userid: req.user._id });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc  Update category
// @route PUT /api/categories/:id
// @access Private (admin, manager)
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    const { name, description, isActive } = req.body;
    category.name = name ?? category.name;
    category.description = description ?? category.description;
    category.isActive = isActive ?? category.isActive;
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete category
// @route DELETE /api/categories/:id
// @access Private (admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
