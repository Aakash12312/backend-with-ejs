const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSummarized: { type: Boolean, default: false },
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Blog', blogSchema);
