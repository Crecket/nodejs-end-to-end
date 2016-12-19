// file system
var fs = require('fs');
var sqlite3 = require("sqlite3");

module.exports = function (config) {

    // check if db exists
    var exists = fs.existsSync(config.database_location);

    // create blank db file if it doesn't exist
    if (!exists) {
        // fs.openSync(config.database_location, "w");
        fs.writeFile(config.database_location, "", function(err) {
            if(err) {
                console.log("Failed to create DB file.");
                console.log(err);
                return;
            }
        });
    }

    // new db object
    var db = new sqlite3.Database(config.database_location);

    // if no database exists, create initial tables
    db.run('CREATE TABLE IF NOT EXISTS "users"(\
       username TEXT NOT NULL,\
       password TEXT NOT NULL,\
       salt TEXT NOT NULL,\
       PRIMARY KEY (username));');

    return db;
}