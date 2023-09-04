const mongoose = require("mongoose");

const statusSchema = require('./status');
const releaseSchema = require('./release');
const Schema = mongoose.Schema;

const repositoryDetailSchema = mongoose.Schema({

  repositoryName: {
    type: String,
    required: true
  },
  repositoryDesc: {
    type: String,
    default: ""
  },
  repositoryDoc:{
    type: String,
    default: ""
  },
  license: {
    type: String,
    default: "None"
  },
  //releases: [{type: releaseSchema.schema}],


  //repositoryUrl: {
  //    type: statusSchema.schema,
  //    required: true,
  //},
      repositoryUrl: {
        type: String,
        required: true
      },



  //reviewers: {
  //},
  //contributorID: {
  //},

 
},
{timestamps: true}
);

//module.exports = mongoose.model('RepositoryDetail', repositoryDetailSchema);
module.exports =repositoryDetailSchema;