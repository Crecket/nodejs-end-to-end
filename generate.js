var forge = require('node-forge');
var fs = require('fs');

// shortcuts
var pki = forge.pki;
var rsa = pki.rsa;

// default file name
var file_name_ssl = "default_cert";
var file_name_rsa = "default_cert";
var folder = "";

// parameters
process.argv.forEach(function (val, index, array) {
    if (index === 2) {
        file_name_ssl = val;
    }
    if (index === 3) {
        file_name_rsa = val;
    }
    if (index === 4) {
        folder = val;
    }
});

function generateSslCertificate(bitSize, inputFileName) {

    var keys = rsa.generateKeyPair(bitSize);
    var cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.privateKey = keys.privateKey;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [{
        name: 'commonName',
        value: 'localhost'
    }, {
        name: 'countryName',
        value: 'NL'
    }, {
        shortName: 'ST',
        value: 'SomeState'
    }, {
        name: 'localityName',
        value: 'someLocation'
    }, {
        name: 'organizationName',
        value: 'CrecketCerts'
    }, {
        shortName: 'OU',
        value: 'Test'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // self-sign certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    var certPem = pki.certificateToPem(cert);
    // var pubKey = pki.publicKeyToPem(keys.publicKey);
    var privKey = pki.privateKeyToPem(keys.privateKey);

    function handleWrite(err) {
        if (err) throw err;
        console.log('It\'s saved!');
    }

    // console.log('Cert');
    // console.log(certPem);
    fs.writeFile(folder + inputFileName + '.crt', certPem, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved ssl certificate to: ' + folder + inputFileName + '.crt');
    });

    // console.log('Private Key');
    // console.log(privKey);
    fs.writeFile(folder + inputFileName + '.key', privKey, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved ssl private key to: ' + folder + inputFileName + '.key');
    });
}

function generateRsaKeyPair(bitSize, file_name_rsa) {

    var keys = rsa.generateKeyPair(bitSize);
    var publicDer = pki.publicKeyToPem(keys.publicKey);
    var privateDer = pki.privateKeyToPem(keys.privateKey);

    fs.writeFile(folder + file_name_rsa + '.key', privateDer, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved rsa private key to: ' + folder + file_name_rsa + '.key');
    });

    fs.writeFile(folder + file_name_rsa + '.crt', publicDer, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved rsa public key to: ' + folder + file_name_rsa + '.crt');
    });
}



// generate a ssl certificate
generateSslCertificate(2048, file_name_ssl);
// generate a rsa certificate
generateRsaKeyPair(2048, file_name_rsa);

/*
param1: ssl file name
param2: rsa file name
param3: folder store location

$ node generate.js ssl rsa certs/

This will create the following files in the certs/ folder:
cers/
    ssl.crt
    ssl.key
    rsa.key
    rsa.crt
 */
