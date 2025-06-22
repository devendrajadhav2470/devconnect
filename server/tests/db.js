const mongoose = require('mongoose');
let isConnected = false;
module.exports.connect = async () => {
  if(isConnected || mongoose.connection.readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/devconnect_test');
  isConnected = true
} ;

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  isConnected = false;
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
