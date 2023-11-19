const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const userV2Schema = mongoose.Schema({


    email: {
        type: String,
        required: true
    },

        password: {
            type: String,
            required: true,
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

// Encriptar la contraseña
userV2Schema.pre("save", function (next) {
    const user = this;
    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, (saltError, salt) => {
            if (saltError) {
                return next(saltError);
            } else {
                bcrypt.hash(user.password, salt, (hashError, hash) => {
                    if (hashError) {
                        return next(hashError);
                    }
                    user.password = hash;
                    next();
                });
            }
        });
    } else {
        return next();
    }
});

module.exports = mongoose.model('UserV2', userV2Schema);