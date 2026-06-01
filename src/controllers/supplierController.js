const Supplier = require('../models/Supplier');

// @desc  Get all suppliers
// @route GET /api/suppliers
// @access Private
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

// @desc  Get supplier by ID
// @route GET /api/suppliers/:id
// @access Private
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

// @desc  Create supplier
// @route POST /api/suppliers
// @access Private (admin, manager)
const createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;
    const supplier = await Supplier.create({ name, email, phone, address, contactPerson });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

// @desc  Update supplier
// @route PUT /api/suppliers/:id
// @access Private (admin, manager)
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }
    const { name, email, phone, address, contactPerson } = req.body;
    supplier.name = name ?? supplier.name;
    supplier.email = email ?? supplier.email;
    supplier.phone = phone ?? supplier.phone;
    supplier.address = address ?? supplier.address;
    supplier.contactPerson = contactPerson ?? supplier.contactPerson;
    const updated = await supplier.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete supplier
// @route DELETE /api/suppliers/:id
// @access Private (admin)
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404);
      throw new Error('Supplier not found');
    }
    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
