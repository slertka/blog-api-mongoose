'use strict';

const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: { type: String},
  author: {
    firstName: { type: String },
    lastName: { type: String }
  },
  content: { type: String }
})

// create virtual so API returns author name as a string rather than an object
blogPostSchema.virtual("authorName").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`;
})

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorName,
    content: this.content,
    created: new Date()
  }
}

const Post = mongoose.model('Post', blogPostSchema, 'blogPosts');

module.exports = {Post};