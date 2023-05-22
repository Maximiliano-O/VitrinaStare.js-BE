const mongoose = require("mongoose");
const contributorSchema = require('./contributor');
const bcrypt = require('bcrypt');
const userSchema = mongoose.Schema({
 userID: {
  type: String,
  unique: true,
  index: true,
  required: true
    
  },
  email: {
    type: String,
    required: true
  },

        password: {
            type: String,
            required: true,
        },
  contrInfo: {
    type: contributorSchema,
    _id: false,
    required: true

  },

},
{timestamps: true}
);
// Hash the password before saving
userSchema.pre("save", function (next) {
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
module.exports = mongoose.model('User', userSchema);