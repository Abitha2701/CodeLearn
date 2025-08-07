const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },                          // ✅ Add required
  email: { type: String, required: true, unique: true },           // ✅ Add required
  password: { type: String, required: true },                      // ✅ Add required
  preferredLanguages: { type: [String], default: [] }              // ✅ Add default
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
