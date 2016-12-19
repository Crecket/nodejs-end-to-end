var assert = require('assert');
var fs = require('fs');

// Load the test preparations
var prepare = require('./prepare');

// when the prepartions finish, run the tests
prepare.then(() => {
    var tests = require('./tests');
})