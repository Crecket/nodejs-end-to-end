var assert = require('assert');
var fs = require('fs');

describe('Application', function () {
    var Db;
    var config;
    var userManagement;

    describe('App', function () {
        it('Should start without errors', function () {
            // require the library
            var App = require(__dirname + '/../src/server/App.js');

            // Create a new app
            var NodeJSApp = new App();
        });
    });

    describe('Config', function () {
        it('Load config file', function () {
            // Get the config class
            var Config = require(__dirname+'/../src/server/Config.js');

            // Load the config file contents
            var config_vars = require(__dirname + '/../src/server/configs/config.js');

            // create the object
            config = new Config(config_vars);
        });
    });

    describe('Db', function () {
        it('Create database handler', function () {
            // Attempt to create database object
            Db = require(__dirname + '/../src/server/Db.js')(config);
        });

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

    describe('Usermanager', function () {
        it('Create the usermanagement object', function () {
            userManagement = require(__dirname + '/../src/server/UserManagement.js')(Db);
        })

        it('loadUsers()', function () {
            userManagement.users.loadUsers();
        })

        it('newUser()', function () {
            return new Promise(function (resolve) {
                userManagement.users.newUser('testusername123', '1234', function (success) {
                    // assert we got no error
                    assert.ok(success);

                    // resolve the promise
                    resolve();
                })
            })
        })

        it('removeUser()', function () {
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