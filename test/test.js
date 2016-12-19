var assert = require('assert');
var fs = require('fs');
var path = require('path');

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

// Copy file if it doesn't already exists to get the default values
fs.stat(__dirname + '/../src/server/configs/config.js', function(err, stat) {
    if(err == null) {
        // file exists
    } else if(err.code == 'ENOENT') {
        // file does not exist
        copyFile(
            __dirname + '/../src/server/configs/config-template.js',
            __dirname + '/../src/server/configs/config.js',
            function(){}
        )
    } else {
        console.log('Config creation error: ', err.code);
    }
});

describe('Application', function () {
    var Db;
    var config;
    var userManagement;

    describe('Config', function () {
        it('Load config file', function () {
            // Load the config file
            config = require(__dirname + '/../src/server/configs/config.js');
        });
    });

    describe('Db', function () {
        it('Create database handler', function () {
            // Attempt to create database object
            Db = require(__dirname + '/../src/server/Db.js')(config);
        });

        describe('Run database queries', function () {

            it('Select users from db', function () {
                return new Promise(function (resolve) {
                    // run the query
                    Db.run('SELECT * FROM users',
                        function (result, err) {
                            // assert we got no error
                            assert.ok(!err);

                            // resolve the promise
                            resolve();
                        }
                    );
                });
            });

            it('Insert a new user', function () {
                return new Promise(function (resolve) {
                    // run the query
                    Db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)',
                        ['crecket', '1234', 'salt'],
                        function (result, err) {
                            // assert we got no error
                            assert.ok(!err);

                            // resolve the promise
                            resolve();
                        }
                    );
                });
            });
        });
    });

    describe('Usermanager', function () {
        it('Create the usermanagement object', function () {
            userManagement = require(__dirname + '/../src/server/user_management.js')(Db);
        })

        describe('loadUsers', function () {
            it('Load the users from the database', function () {
                userManagement.users.loadUsers();
            })
        })

        describe('newUser', function () {
            it('Insert a new user with the hashed password', function () {
                return new Promise(function (resolve) {
                    userManagement.users.newUser('testusername123', '1234', function (success) {
                        // assert we got no error
                        assert.ok(success);

                        // resolve the promise
                        resolve();
                    })
                })
            })
        })

        describe('removeUser', function () {
            it('Remove user', function () {
                return new Promise(function (resolve) {
                    userManagement.users.removeUser('testusername123', function (success) {
                        // assert we got no error
                        assert.ok(success);

                        // resolve the promise
                        resolve();
                    })
                })
            })
        })
    })
})