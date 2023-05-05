const mongoose = require("mongoose");

const repoStatusSchema = mongoose.Schema({
  releaseID: {
    type: Number,
    required: true
  },
  reviewerID: {
    type: String,
    required: true
  },
  isReviewed:{
    type: Boolean,
    default: false,
    required: true,
  },
  isSafe: {
    type: Boolean,
    default: false,
    required: true
  },
  additionalComments: {
    type: String,
    default: "",
  },
  reviewDate: {
    type: Date,
    default: null,
    required: true
  },

 
},
{timestamps: true}
);

module.exports = mongoose.model('RepoStatus', repoStatusSchema);