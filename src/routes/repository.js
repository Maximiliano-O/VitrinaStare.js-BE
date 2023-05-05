const express = require("express");y
const repositorySchema = require("../models/repository");

const router = express.Router();

// create repositorie
router.post("/repositories", (req, res) => {
  const repository = repositorySchema(req.body);
  repository
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all repositories
router.get("/repositories", (req, res) => {
  repositorieSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a repositories
router.get("/repositories/:id", (req, res) => {
  const { id } = req.params;
  repositorieSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// delete a repository
router.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;
  repositorySchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a repository
router.put("/rrepositories/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  repositorySchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
