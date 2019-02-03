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
  // Verify required fields are included in request body
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      res.status(400).json({message: `Missing ${field} in request body`});
    } 
    // Verify if author is a nested object
    else if (field == 'author' && !(req.body.author.firstName || req.body.author.lastName)) {
      res.status(400).json({message: `The author key must be a nested object with author.firstName and author.lastName`});
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
  // Check if request and body ids match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({message: `The request parameter id ${req.params.id} must match the request body id ${req.body.id}`});
  }

  // Check if author is a nested object
  if (req.body.author && !(req.body.author.firstName || req.body.author.lastName)) {
    res.status(400).json({message: `The author key must be a nested object with author.firstName and author.lastName`});
  }

  // Check that only the fields title, author, content, and id are the request body keys
  const requiredKeys = ['title', 'author', 'content', 'id']
  const bodyKeys = Object.keys(req.body);
  for (let i=0; i < bodyKeys.length; i++) {
    const bodyKey = bodyKeys[i];
    if (!(requiredKeys.includes(bodyKey))) {
      res.status(400).json({message: `${bodyKey} is not a valid key:value pair in the response body. The response body may only contain the keys [${requiredKeys}]`});
    }
  }

  Post
    .findByIdAndUpdate(req.params.id, { $set: req.body })
    // Why won't this send the updated post? When I do a GET request, I show that it's updated
    .then(blogPost => res.status(200).send(blogPost.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({message: "Internal server error"});
    })
})

// DELETE reqeust to /posts/:id
app.delete('/posts/:id', (req, res) => {
  Post
    .findByIdAndDelete(req.params.id)
    .then(res.status(204).end())
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