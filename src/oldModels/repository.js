const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const statusSchema = require('../models/status');
const contributorSchema = require("./contributor");
const repositorySchema = mongoose.Schema({

  //repositoryID: {
  //  type: String,
  //  required: true,
  //  unique: true,
  //},


  contributorID: {
    type: String,
    required: true,
  },
  //ownerID: {
  //  type: String,
  //  required: true,
  //},
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['public', 'private'],
    default: 'public',
  },

  imageURL: {
    type: String,
    default: '',
  },
  //lastStatus: {
  //  type: statusSchema.schema,
  //  required: true,
  //},
  lastReleaseDate: {
    type: Date,
    default: Date.now,
  },
  tags: [
    {
      type: String,
    },
  ],
  //repoDetails: {
  //  type: Schema.Types.ObjectId,
  //  ref: "RepositoryDetail",
  //},
      repoDetails: {
        type: contributorSchema,
        _id: false,
        required: true
      },
  totalComments: {
    type: Number,
    default: 0,
  },

      ratings: [{
        userId: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      }],
  totalRating: {
    type: Number,
    default: 0,
    min: 0,
     max: 5,
    },
  },
  {timestamps: true}
  );
  

module.exports = mongoose.model('Repository', repositorySchema);