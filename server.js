const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 5001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/unhappy-moments', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Comment Schema
const commentSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// Define Moment Schema
const momentSchema = new mongoose.Schema({
  content: String,
  category: { type: String, enum: ['daily-irritations', 'random-events', 'general'], default: 'general' },
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema]
});

const Moment = mongoose.model('Moment', momentSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/moments', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const moments = await Moment.find(query).sort({ createdAt: -1 });
    res.json(moments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching moments' });
  }
});

app.post('/api/moments', async (req, res) => {
  try {
    const newMoment = new Moment({
      content: req.body.content,
      category: req.body.category || 'general'
    });
    await newMoment.save();
    res.status(201).json(newMoment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating moment' });
  }
});

app.post('/api/moments/:momentId/comments', async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.momentId);
    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    
    moment.comments.push({ content: req.body.content });
    await moment.save();
    res.status(201).json(moment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 