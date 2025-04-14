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
}, { _id: true }); // Ensure _id is generated for comments

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

app.put('/api/moments/:momentId', async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.momentId);
    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    moment.content = req.body.content;
    moment.category = req.body.category || moment.category;
    await moment.save();
    res.json(moment);
  } catch (error) {
    res.status(500).json({ error: 'Error updating moment' });
  }
});

app.delete('/api/moments/:momentId', async (req, res) => {
  try {
    const moment = await Moment.findByIdAndDelete(req.params.momentId);
    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    res.json({ message: 'Moment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting moment' });
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

app.put('/api/moments/:momentId/comments/:commentId', async (req, res) => {
  try {
    const moment = await Moment.findById(req.params.momentId);
    if (!moment) {
      return res.status(404).json({ error: 'Moment not found' });
    }

    const comment = moment.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.content = req.body.content;
    await moment.save();
    res.json(moment);
  } catch (error) {
    res.status(500).json({ error: 'Error updating comment' });
  }
});

app.delete('/api/moments/:momentId/comments/:commentId', async (req, res) => {
  try {
    console.log('Delete comment request:', {
      momentId: req.params.momentId,
      commentId: req.params.commentId
    });

    const moment = await Moment.findById(req.params.momentId);
    if (!moment) {
      console.log('Moment not found');
      return res.status(404).json({ error: 'Moment not found' });
    }

    console.log('Found moment:', moment);
    console.log('Comments before deletion:', moment.comments);

    // Find the comment index
    const commentIndex = moment.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      console.log('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove the comment using splice
    moment.comments.splice(commentIndex, 1);
    await moment.save();

    console.log('Comment deleted successfully');
    res.json(moment);
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 