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


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://devendrajadhav2470:kTDKQuWAQgHeFW0v@cluster0.1dudlix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

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

