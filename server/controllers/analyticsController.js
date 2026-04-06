const Analytics = require('../models/Analytics');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const data = await Analytics.find().sort({ date: 1 });
    
    // Total calculation
    const currentMetrics = data[data.length - 1] || { activeUsers: 0, newSignups: 0, sales: 0 };
    
    res.json({
      latest: currentMetrics,
      historical: data
    });
  } catch(error) {
    res.status(500).json({ message: 'Server error' });
  }
};
