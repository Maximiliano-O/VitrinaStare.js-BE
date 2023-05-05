const mongoose = require("mongoose");

const repositoryDetailSchema = mongoose.Schema({
  repositoryName: {
    type: String,
    required: true
  },
  repositoryDesc: {
  },
  repositoryDoc:{
  },
  license: {
  },
  releases: [{type: releaseSchema}],
  repositoryUrl: {
      type: statusSchema,
      required: true,    
  },
  reviewers: {
  },
  contributorID: {
  },

 
},
{timestamps: true}
);

module.exports = mongoose.model('RepositoryDetail', repositoryDetailSchema);