const express = require("express");
const userSchema = require("../models/user");
const bcrypt = require('bcrypt');

const router = express.Router();

// create user
router.post("/users", (req, res) => {
    console.log(req.body);
    const user = userSchema(req.body);
  user
      .save()
      .then((data) => res.json(data))
      .catch((error) => {
        console.error("Error saving user:", error);
        res.json({ message: error });
          //console.error("Error saving user:", error);
          //res.status(500).json({ message: error.message });
      });
});

// get all users
router.get("/users", (req, res) => {
  userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a user
router.get("/users/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// delete a user
router.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// update a user
/*
router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  userSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
*/


// update a user
router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
        .findByIdAndUpdate(id, req.body, { new: true })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
/*
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    userSchema.findOne({ email }, (error, user) => {
        if (error) {
            console.error('Error finding user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!user) {
            return res.json({ loggedIn: false });
        }

        bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) {
                console.error('Error comparing passwords:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (isMatch) {
                return res.json({ loggedIn: true, user });
            } else {
                return res.json({ loggedIn: false });
            }
        });
    });
});
*/
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.json({ loggedIn: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return res.json({ loggedIn: true, user });
        } else {
            return res.json({ loggedIn: false });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;