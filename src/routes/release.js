const express = require("express");
const releaseSchema = require("../models/release");

const router = express.Router();

// create comment
router.post("/release", (req, res) => {
    console.log('Received comment data:', req.body);
    const comment = releaseSchema(req.body);
  comment
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all comment
router.get("/release", (req, res) => {
  releaseSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a comment
router.get("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


// delete a comment
router.delete("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a comments
router.put("/comments/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  releaseSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// add a status to a release
router.post("/releases/:id/statuses", (req, res) => {
    const { id } = req.params;
    const statusData = req.body;

    releaseSchema
        .findById(id)
        .then((release) => {
            // Create a new status using the statusData and push it into the release's statuses array
            release.statuses.push(statusData);

            // Save the modified release document
            return release.save();
        })
        .then((updatedRelease) => res.json(updatedRelease))
        .catch((error) => res.json({ message: error }));
});

router.get("/release/:repositoryID", (req, res) => {
    const { repositoryID } = req.params;
    releaseSchema
        .find({ repositoryID: repositoryID })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
module.exports = router;
