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