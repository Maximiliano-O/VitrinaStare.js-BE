const express = require("express");
const userV2Schema = require("../models/userV2");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

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
router.put("/usersV2/:id", (req, res) => {
    const { id } = req.params;
    userV2Schema
        .findByIdAndUpdate(id, req.body, { new: true })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    userV2Schema.findOne({ email }, (error, user) => {
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



router.get("/usersV2/email/:email", (req, res) => {
    const { email } = req.params;
    userV2Schema
        .findOne({ email })
        .select('-password')
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
router.post('/loginV2', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userV2Schema.findOne({ email });

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

//fetch random ammount of users
router.get("/usersV2/random/:id/:n", async (req, res) => {
    const { id, n } = req.params;
    try {
        const users = await userV2Schema.aggregate([
            { $match: { _id: { $ne: mongoose.Types.ObjectId(id) } } },
            { $sample: { size: parseInt(n) } }
        ]);
        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Fetch github URL
router.get("/usersV2/urlGithubProfile/:id", (req, res) => {
    const { id } = req.params;
    userV2Schema
        .findById(id, 'urlGithubProfile') // This ensures only urlGithubProfile field is returned
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Revisa si hay algun usuario en la db que tenga un url github específico.
router.get("/usersV2/github/:githubUrl", async (req, res) => {
    const githubUrl = decodeURIComponent(req.params.githubUrl);

    try {
        const user = await userV2Schema.findOne({ urlGithubProfile: githubUrl });

        if (user) {
            // User exists in database
            res.json({ exists: true, user });
        } else {
            // User does not exist in database
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get("/usersV2/email/:email", (req, res) => {
    const { email } = req.params;
    userV2Schema
        .findOne({ email: email })
        .then((data) => {
            if (data) {
                res.json(data)
            } else {
                res.json({ message: 'No user found with this email' });
            }
        })
        .catch((error) => res.json({ message: error }));
});

module.exports = router;