const express = require("express");
const repoV2Schema = require("../models/repoV2");
const Release = require("../models/release");



const router = express.Router();

// create repo
router.post("/repoV2", (req, res) => {
  const repoV2 = repoV2Schema(req.body);
    repoV2
      .save()
      .then((data) => res.json(data))
      .catch((error) => {
        console.error("Error saving user:", error);
        res.json({ message: error });
      });
});

// get all repos
router.get("/repoV2", (req, res) => {
    repoV2Schema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a repo
router.get("/repoV2/:id", (req, res) => {
  const { id } = req.params;
    repoV2Schema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.get("/unique-tags", (req, res) => {
    repoV2Schema
        .aggregate([
            { $unwind: "$tags" },
            { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
        ])
        .then((data) => res.json(data[0].uniqueTags))
        .catch((error) => res.json({ message: error }));
});


// add or edit rating to a repository
router.post("/repoV2/:id/ratings", (req, res) => {
    const { id } = req.params;
    const { userId, rating } = req.body;

    repoV2Schema.findById(id)
        .then((repoV2) => {
            // Remove the rating if it already exists
            const existingIndex = repoV2.ratings.findIndex(r => r.userId === userId);
            if (existingIndex !== -1) {
                repoV2.ratings.splice(existingIndex, 1);
            }

            // Push a new rating
            repoV2.ratings.push({ userId, rating });

            // Calculate the new total rating
            const totalRating = repoV2.ratings.reduce((total, r) => total + r.rating, 0);
            repoV2.totalRating = totalRating / repoV2.ratings.length;

            // Save the changes
            return repoV2.save();
        })
        .then(() => res.json({ message: 'Rating added or updated!' }))
        .catch((error) => res.json({ message: error.toString() }));
});
// delete rating to a repository
router.delete("/repoV2/:id/ratings", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    repoV2Schema.findById(id)
        .then((repoV2) => {
            // Find the index of the rating
            const existingIndex = repoV2.ratings.findIndex(r => r.userId === userId);

            // If the rating exists, remove it
            if (existingIndex !== -1) {
                repoV2.ratings.splice(existingIndex, 1);

                // Calculate the new total rating
                const totalRating = repoV2.ratings.reduce((total, r) => total + r.rating, 0);
                repoV2.totalRating = repoV2.ratings.length > 0 ? totalRating / repoV2.ratings.length : 0;

                // Save the changes
                return repoV2.save();
            }
        })
        .then(() => res.json({ message: 'Rating deleted!' }))
        .catch((error) => res.json({ message: error.toString() }));
});

//return all rating
router.get("/repoV2/:id/ratings", (req, res) => {
    const { id } = req.params;
    repoV2Schema
        .findById(id)
        .then((repoV2) => {
            if (!repoV2) {
                return res.status(404).json({message: `No repository found with id: ${id}`});
            }
            res.json(repoV2.ratings);
        })
        .catch((error) => res.status(500).json({ message: error.toString() }));
});

// update a repo
router.put("/repoV2/:id", async (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    try {
        const updatedUser = await repoV2Schema.findOneAndUpdate(
            { _id: id },
            { $set: updateUser },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});


router.get("/repoV2/contributor/:contributorID", (req, res) => {
    const { contributorID } = req.params;
    repoV2Schema
        .find({ contributorID: contributorID })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});



router.post("/repoV2/verify", async (req, res) => {
    try {
        // Get all the releases where verified = true
        const verifiedReleases = await Release.find({ verified: true });

        // Extract the repositoryIDs from the releases
        const repositoryIDs = verifiedReleases.map(release => release.repositoryID);

        // Update the repositories where the id is in repositoryIDs and verified = false
        await repoV2Schema.updateMany(
            { _id: { $in: repositoryIDs }, verified: false },
            { $set: { verified: true } }
        );

        res.json({ message: 'Repositories verified successfully!' });
    } catch (error) {
        console.error("Error verifying repositories:", error);
        res.status(500).json({ message: error.toString() });
    }
});

module.exports = router;