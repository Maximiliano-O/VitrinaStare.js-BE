const express = require('express');
const nodemailer = require('nodemailer');


const router = express.Router();

router.post("/send-emails", (req, res) => {
    const { emails, repositoryLink } = req.body;

    // Create a nodemailer transporter using the email service credentials
    //const transporter = nodemailer.createTransport({
    //    service: 'gmail',
    //    auth: {
    //        user: 'starejs.dashboard@gmail.com',
    //        pass: 'password',
    //    },
    //});

    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'soyelmitchellvera@hotmail.com',
            pass: 'maxsteel'
        }
    });

    // Send emails to the random user emails with the repository link
    emails.forEach(email => {
        const mailOptions = {
            from: 'soyelmitchellvera@hotmail.com',
            to: email,
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
    });
});

module.exports = router;