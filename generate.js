var forge = require('node-forge');
var fs = require('fs');

// shortcuts
var pki = forge.pki;
var rsa = pki.rsa;

// default file name
var file_name = "default_cert";

// parameters
process.argv.forEach(function (val, index, array) {
    // console.log(index + ': ' + val);
    if (index === 2) {
        // overwrite file name
        file_name = val;
    }
});

console.log(file_name);

function generateKeypair(bitSize, inputFileName) {

    var keys = rsa.generateKeyPair(bitSize);
    var cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.privateKey = keys.privateKey;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [{
        name: 'commonName',
        value: 'localhost'
    }, {
        name: 'countryName',
        value: 'US'
    }, {
        shortName: 'ST',
        value: 'Virginia'
    }, {
        name: 'localityName',
        value: 'Blacksburg'
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
    var pubKey = pki.publicKeyToPem(keys.publicKey);
    var privKey = pki.privateKeyToPem(keys.privateKey);

    function handleWrite(err) {
        if (err) throw err;
        console.log('It\'s saved!');
    }

    console.log('Cert');
    console.log(certPem);
    fs.writeFile(inputFileName + '.crt', certPem, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved the certificate to: ' + inputFileName + '.crt');
    });

    console.log('Private Key');
    console.log(privKey);
    fs.writeFile(inputFileName + '.key', privKey, 'utf8', function (err) {
        if (err) throw err;
        console.log('Saved the private key to: ' + inputFileName + '.key');
    });

    // Not required
    // console.log('Public key');
    // console.log(pubKey);
    // fs.writeFile(inputFileName + '.pub', pubKey, 'utf8', function (err) {
    //     if (err) throw err;
    //     console.log('Saved the public key to: ' + inputFileName + '.pub');
    // });
}

generateKeypair(2048, file_name);
// generateKeypair(1024, file_name);
