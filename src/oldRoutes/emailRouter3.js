const express = require('express');

const nodemailer = require('nodemailer');
const UserV2 = require('../models/userV2');  // Import UserV2 model
const Release = require('../models/release');  // Import Release model
const Status = require('../models/status');  // Import Status model


const router = express.Router();

router.post("/send-emails", async (req, res) => {
    const { verificationLink, releaseID } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'soyelmitchellvera@hotmail.com',
            pass: 'maxsteel'
        }
    });

    try {

        const users = await UserV2.find({}).exec();

        const selectedUsers = [];
        for (let i = 0; i < config.numUsersToSelect; i++) {
            const randomIndex = Math.floor(Math.random() * users.length);
            selectedUsers.push(users[randomIndex]);
            users.splice(randomIndex, 1);
        }

        selectedUsers.forEach(async (user) => {
            // Create a new Status for the selected user
            const status = new Status({
                releaseID: releaseID,
                reviewerID: user._id,
                isReviewed: false,
                isSafe: false,
                additionalComments: ''
            });

            // Save the new Status
            await status.save();

            // Add the new Status to the 'statuses' array of the Release
            await Release.findByIdAndUpdate(
                releaseID,
                { $push: { statuses: status._id } }
            );
/*
            const mailOptions = {
                from: 'soyelmitchellvera@hotmail.com',
                to: user.email,
                subject: 'SELECCIONADO Revisión Stare.js',
                text: `¡Hola!, Has sido seleccionado aleatoriamente para una revisión de un repositorio. \n
                Te solicitamos dar tu aprobación o rechazo respecto al repositorio en cuestión.\n
                 Click the link to access the repository: ${repositoryLink}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email', error);
                    res.json({ message: error });
                } else {
                    console.log('Email sent', info.response);
                    res.json({ message: 'Email sent', info: info.response });
                }
            });

            */

        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.json({ message: 'Error fetching users', error: error });
    }
});

module.exports = router;