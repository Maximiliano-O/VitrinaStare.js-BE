const express = require("express");
const userV2Schema = require("../models/userV2");
const bcrypt = require('bcrypt');

const router = express.Router();

// create user
router.post("/usersV2", (req, res) => {
    console.log(req.body);
    const user = userV2Schema(req.body);
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
router.get("/usersV2", (req, res) => {
    userV2Schema
        .find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// get a user
router.get("/usersV2/:id", (req, res) => {
    const { id } = req.params;
    userV2Schema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// delete a user
router.delete("/usersV2/:id", (req, res) => {
    const { id } = req.params;
    userV2Schema
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
router.put("/usersV2/:id", (req, res) => {
    const { id } = req.params;
    userV2Schema
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


router.get("/usersV2/email/:email", (req, res) => {
    const { email } = req.params;
    userSchema
        .findOne({ email })
        .select('-password')
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
router.post('/loginV2', async (req, res) => {
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