const setupMongoose = require("./init/db");
const {setupServer} = require("./init/server");

setupMongoose(()=>{
    setupServer()
})