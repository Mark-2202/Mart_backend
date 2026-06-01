const Customer = require('../models/Customer');

// @desc  Get all customers
// @route GET /api/customers
// @access Private
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const customers = await Customer.find(filter);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc  Get customer by ID
// @route GET /api/customers/:id
// @access Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc  Create customer
// @route POST /api/customers
// @access Private
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await Customer.create({ name, email, phone });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc  Update customer
// @route PUT /api/customers/:id
// @access Private
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    const { name, email, phone, loyaltyPoints } = req.body;
    customer.name = name ?? customer.name;
    customer.email = email ?? customer.email;
    customer.phone = phone ?? customer.phone;
    customer.loyaltyPoints = loyaltyPoints ?? customer.loyaltyPoints;
    const updated = await customer.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete customer
// @route DELETE /api/customers/:id
// @access Private (admin, manager)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
