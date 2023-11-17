const mongoose = require("mongoose");

const userV2Schema = mongoose.Schema({


    email: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
    },
    imageURL: {
        type: String

    },
    latestPost: {
        type: String,
        default: '',
    },
    urlGithubProfile: {
        type: String
    },

        description: {
            type: String
        },
    totalComments: {
        type: Number,
        default: 0,
        min: 0,
    },


    },
    {timestamps: true}
);

module.exports = mongoose.model('UserV2', userV2Schema);