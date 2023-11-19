const express = require("express");
const repoDetailSchema = require("../oldModels/repositorydetail");

const router = express.Router();

// create repositoryDetail
router.post("/repoDetail", (req, res) => {
  const repoDetail = repoDetailSchema(req.body);
  repoDetail
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all repositoryDetail
router.get("/repoDetail", (req, res) => {
    repoDetailSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a repositoryDetail
router.get("/repoDetail/:id", (req, res) => {
  const { id } = req.params;
  repoDetailSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// delete a repositoryDetail
router.delete("/repoDetail/:id", (req, res) => {
  const { id } = req.params;
  repoDetailSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a repositoryDetail
router.put("/repoDetail/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  repoDetailSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
