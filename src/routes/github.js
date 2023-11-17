const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/api/checkUser/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        res.send({ exists: true });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.send({ exists: false });
        } else {
            res.status(500).send({ error: 'An error occurred' });
        }
    }
});


router.get('/api/checkRepo/:owner/:repo', async (req, res) => {
    const owner = req.params.owner;
    const repo = req.params.repo;
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        res.send({ exists: true });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.send({ exists: false });
        } else {
            res.status(500).send({ error: 'An error occurred' });
        }
    }
});


module.exports = router;