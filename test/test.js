var assert = require('assert');

var Db;
var config;
var userManagement;

// userManagement.users.newUser('crecket', '1234', (success) => {
//     console.log(success);
//     if(success){
//         userManagement.users.removeUser('crecket', (success) => {
//             console.log(success);
//         })
//     }
// })


describe('Config', function () {
    it('Load config file', function () {
        // Load the config file
        config = require('../src/server/configs/config');
    });
});

describe('Db', function () {
    it('Create database handler', function () {
        // Attempt to create database object
        Db = require('../src/server/Db')(config);
    });

    describe('Run database queries', function () {

        it('Select users from db', function () {
            return new Promise(function (resolve) {
                // run the query
                Db.run('SELECT 12* FROM users',
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
        userManagement = require('../src/server/user_management')(Db);
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