const mongoose = require("mongoose");
const repoStatusSchema = require('./status');
const Schema = mongoose.Schema;
const releaseSchema = mongoose.Schema({
 // id: {
 //   type: String,
 //   required: true,
 //   unique: true,
 // },
  //tag_name: {
  //  type: String,
  //  required: true,
  //},

  repositoryID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

  codesandbox_URL: {
    type: String,
    default: '',
  },
  //totalComments: {
  //  type: Number,
  //  default: 0,
  //},
  //totalRating: {
  //  type: Number,
  //  default: 0,
  //  min: 0,
  //  max: 5,
  //},
  //downloads: {
  //  type: Number,
  //  default: 0,
  //},
  //finalStatus: {
  //  type: repoStatusSchema.schema,
  //  default: () => new mongoose.model("RepoStatus", repoStatusSchema)(),
  //},
  //statuses: [
  //  {
  //    type: repoStatusSchema.schema
  //  }
  //],
  //comments: [
   // {
   //   type: Schema.Types.ObjectId,
   //   ref: "Comment",
    //},
  //],
});


module.exports = mongoose.model('Release', releaseSchema);