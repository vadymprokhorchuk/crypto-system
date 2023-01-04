const express = require('express')
const {logger} = require('../helpers/logger')

const logout = express.Router();

logout.all('/logout', (req, res) => {
    try {
        req.session.destroy(async function () {
            res.redirect('/login');
        });
    }catch (err){
        res.redirect('/login');
        logger.error(err)
    }
})

module.exports = {logout}