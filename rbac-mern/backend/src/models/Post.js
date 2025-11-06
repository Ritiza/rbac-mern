const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  authorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  createdAt: {type:Date, default:Date.now},
  updatedAt: Date
});

module.exports = mongoose.model('Post', postSchema);
