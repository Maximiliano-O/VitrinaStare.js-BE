const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const statusSchema = require('./status');
const repositorySchema = mongoose.Schema({

  repositoryID: {
    type: String,
    required: true,
    unique: true,
  },
  contributorID: {
    type: String,
    required: true,
  },
  ownerID: {
    type: String,
    required: true,
  },
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
  lastStatus: {
    type: statusSchema.schema,
    required: true,
  },
  lastRealeaseDate: {
    type: Date,
    default: Date.now,
  },
  tags: [
    {
      type: String,
    },
  ],
  repoDetails: {
    type: Schema.Types.ObjectId,
    ref: "RepositoryDetail",
  },
  totalComments: {
    type: Number,
    default: 0,
  },
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