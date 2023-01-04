const {findUser} = require("../models/user")
const {logger} = require("../helpers/logger");

async function dbuser(req, res, next) {
    try {
        let dbuser = await findUser({username: req.session?.user?.username})
        if (dbuser) {
            req.session.user = dbuser
        }
    }catch (err){
        logger.log(err)
    }finally {
        next()
    }
}

module.exports = {dbuser}