'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

// use mongoose promises as global promises
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models')

const app = express();

app.use(express.json());
app.use(morgan('common'));

// GET request to /posts
app.get('/posts', (req, res) => {

})

// GET request to /posts/:id
app.get('/posts/:id', (req, res) => {

})

// POST request to /posts
app.post('/posts', (req, res) => {

})

// PUT request to /posts/:id
app.put('/posts/:id', (req, res) => {

})

// DELETE reqeust to /posts/:id
app.delete('/posts/:id', (req, res) {

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