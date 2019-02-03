const express = require('express');
const router = express.Router();

const { Post } = require('./models');

router.use(express.json());

// GET request to /posts
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
  Post
    .findById(req.params.id)
    .then(blogPost => res.json(blogPost.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({message: "Internal server error"})
    })
})

// POST request to /posts
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
  Post
    .findByIdAndDelete(req.params.id)
    .then(res.status(204).end())
})

module.exports = router;