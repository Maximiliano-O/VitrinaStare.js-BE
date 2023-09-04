const mongoose = require("mongoose");

const repoStatusSchema = new mongoose.Schema({
  releaseID: {
    type: String,
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
    default: Date.now

  },

 
},
{timestamps: true}
);


module.exports = repoStatusSchema;