'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

// use mongoose promises as global promises
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Post } = require('./models')

const app = express();

app.use(express.json());
app.use(morgan('common'));

// GET request to /posts
app.get('/posts', (req, res) => {
  Post.find()
    .then(blogPosts => {
      res.json({
        blogPosts: blogPosts.map(post => post.serialize())
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({message: "Internal server error"})
    })
})

// GET request to /posts/:id
app.get('/posts/:id', (req, res) => {
  Post
    .findById(req.params.id)
    .then(blogPost => res.json(blogPost.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({message: "Internal server error"})
    })
})

// POST request to /posts
app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'author', 'content'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      res.status(400).json({message: `Missing ${field} in request body`});
    } else if (field == 'author' && !(req.body.author.firstName || req.body.author.lastName)) {
      res.status(400).json({message: `The author field must be a nested object with author.firstName and author.lastName`});
    }
  }

  Post
    .create({
      title: req.body.title,
      author: req.body.author,
      content: req.body.content
    })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({message: "Internal server error"})
    })
})

// PUT request to /posts/:id
app.put('/posts/:id', (req, res) => {

})

// DELETE reqeust to /posts/:id
app.delete('/posts/:id', (req, res) => {

})

// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

let server;
// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };