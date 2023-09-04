const express = require("express");
const releaseSchema = require("../models/release");

const router = express.Router();

// create release
router.post("/release", (req, res) => {
    console.log('Received release data:', req.body);
    const release = new releaseSchema(req.body);
  release
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all releases
router.get("/release", (req, res) => {
  releaseSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a release given it's id
router.get("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get all releases of one repository
router.get("/release/repository/:repositoryID", (req, res) => {
    const { repositoryID } = req.params;
    releaseSchema
        .find({ repositoryID })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
// delete a release
router.delete("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a release
router.put("/release/:id", (req, res) => {
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

//router.get("/release/:repositoryID", (req, res) => {
//    const { repositoryID } = req.params;
//    releaseSchema
//        .find({ repositoryID: repositoryID })
//        .then((data) => res.json(data))
//        .catch((error) => res.json({ message: error }));
//});

//Add status to the status list of a specific release
router.post('/release/:id/status', async (req, res) => {
    const newStatus = req.body; // Access the status data directly from req.body

    try {
        // Find the release by ID and push new status into statuses
        const release = await releaseSchema.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { statuses: newStatus } },
            { new: true } // return updated release
        );

        // Extract all the isSafe values
        const isSafeValues = release.statuses.map(status => status.isSafe);

        // Count how many are true
        const countIsSafe = isSafeValues.reduce((sum, isSafe) => sum + (isSafe ? 1 : 0), 0);

        // Verify if the true count is more than half of total status count
        if (countIsSafe > release.statuses.length / 2) {
            release.verified = true;
        } else {
            release.verified = false;
        }

        // Save updated release information
        await release.save();

        // Return the updated release data
        res.json(release);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;
