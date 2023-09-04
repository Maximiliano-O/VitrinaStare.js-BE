const mongoose = require("mongoose");



const repoV2Schema = mongoose.Schema({


        contributorID: {
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

        imageURL: {
            type: String,
            default: '',
        },

        //lastReleaseDate: {
        //    type: Date,
        //    default: Date.now,
        //},
        tags: [
            {
                type: String,
            },
        ],


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

        repositoryUrl: {
            type: String,
            required: true
        },


},
{timestamps: true}
);

module.exports = mongoose.model('repoV2', repoV2Schema);