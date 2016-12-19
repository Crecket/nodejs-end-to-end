var assert = require('assert');

var Db;
var config;

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