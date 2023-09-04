const express = require("express");
const repositorySchema = require("../models/repository");


const router = express.Router();

// create repository
const RepositoryDetail = require('../models/RepositoryDetail');
const userSchema = require("../models/user");

//router.post("/repositories", (req, res) => {
  // Create and save a new RepositoryDetail document
//  const repoDetail = new RepositoryDetail(req.body);
//  repoDetail
//      .save()
//      .then((savedRepoDetail) => {
//        // Create a new Repository document with the saved RepositoryDetail's _id
//        const repositoryData = {
//          ...req.body,

//          repoDetails: savedRepoDetail._id,
//        };
//        const repository = new repositorySchema(repositoryData);

        // Save the Repository document
//        return repository.save().then((savedRepository) => {
          // Send the saved Repository and RepositoryDetail data in the response
//          res.json({
//            repository: savedRepository,
//            repositoryDetail: savedRepoDetail,
//          });
//        });
//      })
//      .catch((error) => {
//        res.json({ message: error });
//      });
//});

router.post("/repositories", (req, res) => {
    const repo = repositorySchema(req.body);
    repo
        .save()
        .then((data) => res.json(data))
        .catch((error) => {
            console.error("Error saving repository:", error);
            res.json({ message: error });
        });
});


// get all repositories
router.get("/repositories", (req, res) => {
  repositorySchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a repositories
router.get("/repositories/:id", (req, res) => {
  const { id } = req.params;
  repositorySchema
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
router.put("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  repositorySchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


// get unique tags of all repositories
//router.get("/unique-tags", (req, res) => {
//  repositorySchema
//      .aggregate([
//        { $unwind: "$tags" },
//        { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
//      ])
//      .then((data) => res.json(data[0].uniqueTags))
//      .catch((error) => res.json({ message: error }));
//});

// get all repositories by the same contributor
router.get("/repositories/contributor/:contributorID", (req, res) => {
  const { contributorID } = req.params;
  repositorySchema
      .find({ contributorID })
      .then((data) => res.json(data))
      .catch((error) => res.json({ message: error }));
});

// add or edit rating to a repository
router.post("/repositories/:id/ratings", (req, res) => {
    const { id } = req.params;
    const { userId, rating } = req.body;
    repositorySchema
        .findById(id)
        .then(repository => {
            return repository.addRating(userId, rating).then(() => {
                res.json({ message: 'Rating added or updated!' });
            });
        })
        .catch((error) => res.json({ message: error }));
});


router.delete("/repositories/:id/ratings", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    repositorySchema
        .findById(id)
        .then(repository => {
            return repository.deleteRating(userId).then(() => {
                res.json({ message: 'Rating deleted!' });
            });
        })
        .catch((error) => res.json({ message: error }));
});
module.exports = router;

