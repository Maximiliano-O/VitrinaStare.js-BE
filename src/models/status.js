const mongoose = require("mongoose");

const repoStatusSchema = new mongoose.Schema({


  releaseID: {
    type: String,
    required: true
  },

      //Usuario que le toca revisar
  reviewerID: {
    type: String,
    required: true
  },

  //¿Ha sido revisado por el usuario en cuestión?
  isReviewed:{
    type: Boolean,
    default: false,
    required: true,
  },
      //¿Ha sido aprobado por el usuario en cuestión?
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