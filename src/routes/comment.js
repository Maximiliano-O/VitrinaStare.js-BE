const express = require("express");
const commentSchema = require("../models/comment");

const router = express.Router();

// create comment
router.post("/comments", (req, res) => {
  const comment = userSchema(req.body);
  comment
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all comment
router.get("/comments", (req, res) => {
  commentSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a comment
router.get("/comments/:id", (req, res) => {
  const { id } = req.params;
  commentSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all comments by repositoryID
router.get('/comments/repository/:repositoryID', async (req, res) => {
    const repositoryID = req.params.repositoryID;
    try {
      const comments = await getCommentsByRepositoryID(repositoryID);
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  // get all comments by authorID
router.get('/comments/author/:authorID', async (req, res) => {
    const authorID = req.params.authorID;
    try {
      const comments = await getCommentsByAuthorID(authorID);
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
// delete a comment
router.delete("/comments/:id", (req, res) => {
  const { id } = req.params;
  commentsSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a comments
router.put("/comments/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  commentSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
