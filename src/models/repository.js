const mongoose = require("mongoose");

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
  totalDownloads: {
    type: Number,
    default: 0,
  },
  imageURL: {
    type: String,
    default: '',
  },
  lastStatus: {
    type: statusSchema,
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
    ref: "RepositoryDetails",
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