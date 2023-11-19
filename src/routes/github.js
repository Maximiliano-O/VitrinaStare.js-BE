const express = require('express');
const axios = require('axios');

const router = express.Router();



// Revisa si existe la cuenta GitHub del usuario
router.get("/checkUserExists/:userUrl", async (req, res) => {
    const username = decodeURIComponent(req.params.userUrl).split('https://github.com/')[1];
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);

        res.json({ exists: true, userData: response.data });
    } catch (error) {
        if (error.response && error.response.status == 404) {
            res.json({ exists: false });
        } else {
            res.status(500).json({ message: error.toString() });
        }
    }
});

// Revisa si existe un repositorio (Público) de GitHub y si pertenece a la cuenta GitHub del usuario
router.get("/checkRepoExistsAndMatchesUser/:userUrl/:repoUrl", async (req, res) => {
    const username = decodeURIComponent(req.params.userUrl).split('https://github.com/')[1];
    const repoName = decodeURIComponent(req.params.repoUrl).split(`https://github.com/${username}/`)[1];

    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
        res.json({ exists: true, repoData: response.data });
    } catch (error) {
        if (error.response && error.response.status == 404) {
            res.json({ exists: false });
        } else {
            res.status(500).json({ message: error.toString() });
        }
    }
});

module.exports = router;