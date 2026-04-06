require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

mongoose.connect(process.env.MONGO_URI, {})
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany();
    await Analytics.deleteMany();

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Super Admin',
      email: 'admin@dashboard.com',
      password: hashedPassword,
      role: 'Admin'
    });
    
    const managerPassword = await bcrypt.hash('manager123', salt);
    await User.create({
      name: 'Manager User',
      email: 'manager@dashboard.com',
      password: managerPassword,
      role: 'Manager'
    });
    
    // Seed Analytics Data (Last 10 Days)
    const analyticsData = [];
    for(let i=9; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      analyticsData.push({
        date: d,
        activeUsers: Math.floor(Math.random() * 500) + 100,
        newSignups: Math.floor(Math.random() * 50) + 10,
        sales: Math.floor(Math.random() * 5000) + 500,
        pageViews: Math.floor(Math.random() * 2000) + 500
      });
    }
    await Analytics.insertMany(analyticsData);

    console.log('Database seeded successfully!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
