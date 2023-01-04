const express = require('express')
const {logger} = require("../helpers/logger");
const {dbuser} = require("../middlewares/dbuser");

const create = express.Router();

create.get('/create', dbuser, async (req, res) => {
    try {
        if (req.session.user) {
            if (req.session.user.wallet){
                res.redirect('/panel');
            }else{
                res.render('create');
            }
        } else {
            res.redirect('/login');
        }
    }catch (err){
        logger.error(err)
    }
})

module.exports = {create}