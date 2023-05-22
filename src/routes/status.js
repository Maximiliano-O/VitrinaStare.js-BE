const express = require("express");
const statusSchema = require("../models/status");

const router = express.Router();

// create status
router.post("/status", (req, res) => {
  const status = statusSchema(req.body);
  status
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all status
router.get("/status", (req, res) => {
    statusSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a status
router.get("/status/:id", (req, res) => {
  const { id } = req.params;
  statusSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// delete a status
router.delete("/status/:id", (req, res) => {
  const { id } = req.params;
  statusSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a status
router.put("/status/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  statusSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;