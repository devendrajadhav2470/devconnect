require('dotenv').config();  // Load environment variables from .env

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;
const homeRoutes = require('./routes/homeRoutes');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');
// Connect to MongoDB
const protectedRoutes = require('./routes/protectedRoutes');
const postRoutes = require('./routes/postRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const path = require('path');

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });
app.use(cors());
app.use('/api/protected', protectedRoutes);
app.use(express.json()); // For parsing application/json
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


console.log(`Configured port: ${port}`);
app.use('/', homeRoutes);
console.log("Mongo URI:", process.env.MONGO_URI);
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI, {
    // options
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
module.exports = app;

