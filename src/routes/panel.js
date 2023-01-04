const express = require('express')
const {logger} = require("../helpers/logger");
const {dbuser} = require("../middlewares/dbuser");

const panel = express.Router();

panel.get('/panel', dbuser, async (req, res) => {
    try {
        if (req.session.user) {
            if (req.session.user.wallet){
                await res.render('panel', {user:req.session.user});
            }else{
                res.redirect('/create');
            }
        } else {
            res.redirect('/login');
        }
    }catch (err){
        logger.error(err)
    }
})

module.exports = {panel}