// file system
var fs = require('fs');
var sqlite3 = require("sqlite3");

module.exports = function (config) {
    const sqliteDbLocation = './src/server/data/database.db';

    // check if db exists
    var exists = fs.existsSync(sqliteDbLocation);

    // create blank db file if it doesn't exist
    if (!exists) {
        console.log("Creating DB file.");
        fs.openSync(sqliteDbLocation, "w");
    }

    // new db object
    var db = new sqlite3.Database(sqliteDbLocation);

    // if no database exists, create initial tables
    db.run('CREATE TABLE IF NOT EXISTS "users"(\
       username TEXT NOT NULL,\
       password TEXT NOT NULL,\
       salt TEXT NOT NULL,\
       PRIMARY KEY (username));');

    return db;
}