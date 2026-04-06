const Content = require('../models/Content');

exports.getAllContent = async (req, res) => {
  try {
    const contents = await Content.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, body, status } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    const content = await Content.create({
      title,
      body,
      status: status || 'Draft',
      author: req.user.id
    });
    
    // optionally emit to all connected clients if real-time tracking of content changes is desired
    if (req.io) {
      req.io.emit('contentUpdate', { type: 'CREATE', content });
    }
    
    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { title, body, status } = req.body;
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { title, body, status },
      { new: true }
    ).populate('author', 'name email');
    
    if (req.io) {
      req.io.emit('contentUpdate', { type: 'UPDATE', content });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    
    if (req.io) {
      req.io.emit('contentUpdate', { type: 'DELETE', id: req.params.id });
    }
    
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
