var fs = require('fs');

module.exports = new Promise((resolve, reject)=>{

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
            // we're ready with preparations
            resolve();
        } else if(err.code == 'ENOENT') {
            // file does not exist
            copyFile(
                __dirname + '/../src/server/configs/config-template.js',
                __dirname + '/../src/server/configs/config.js',
                function(){
                    // we're ready with preparations
                    resolve();
                }
            )
        } else {
            console.log('Config creation error: ', err.code);
            reject();
        }
    });
})
