const express = require('express')

const notFound = express.Router();

notFound.all('*', async (req, res) => {
    await res.status(404).send('<style>body{background-color: red;}</style>');
})

module.exports = {notFound}