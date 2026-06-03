const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const connectDB = require('./src/config/database');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@minimart.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@minimart.com',
        passwordHash: 'Admin123!',
        role: 'admin',
        isActive: true
      });
      console.log(' Admin user created');
      console.log(' Email: admin@minimart.com');
      console.log(' Password: Admin123!');
    } else {
      console.log(' Admin user already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();