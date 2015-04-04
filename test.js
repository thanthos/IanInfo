var assert = require('chai').assert;
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

describe('Checking Router Model EPC3825', function() {

    // Set up Router
    var router = require('./routers/EPC3825');
    it('Landing Page: MACAddress ', function(done) {
        fs.readFile('./test/landingPage.html',
            function(err, data) {
                var result = router.parseLandingPage(
                    decoder.write(data));
                if (result.MACAddress ==
                    'a4:a2:4a:5f:1f:c7') {
                    done();
                } else {
                    done("Does Not Match");
                }
            })
    });

    it('Login Success', function(done) {
        fs.readFile('./test/LoginPass.html', function(err, data) {
            var result = router.checkLogin(decoder.write(
                data));
            if (result) {
                done();
            } else {
                done(
                    'Expected to Logged In Successfully.'
                );
            }

        });
    });

    it('Login Failed', function(done) {
        fs.readFile('./test/LoginFail.html', function(err, data) {
            var result = router.checkLogin(decoder.write(
                data));
            if (!result) {
                done();
            } else {
                done("Expected to Fail Login");
            }

        });
    });

    it('Status:WAN', function(done) {
        fs.readFile('./test/wan.html', function(err, data) {
            var result = router.parseWANStatus(decoder.write(
                data));

            if (result.MACAddress ==
                'a4:a2:4a:5f:1f:c7') {
                done();
            } else {
                done("Expecting to get WAN info.");
            }
        });
    });

    it('Status:LAN', function(done) {
        fs.readFile('./test/lan.html', function(err, data) {
            var result = router.parseLANStatus(decoder.write(
                data));
            if (result.MACAddress ==
                'a4:a2:4a:5f:1f:c9') {
                done();
            } else {
                done("Expecting to get WAN info.");
            }
        });
    });

    it('Status:WLAN', function(done) {
        fs.readFile('./test/wlan.html', function(err, data) {
            var result = router.parseWLANStatus(decoder
                .write(data));
            if (result.vb_macaddr.indexOf(
                    '0C:54:A5:C3:DA:F7') > -1) {
                done();
            } else {
                done("Expecting to get WLAN info.");
            }
        });
    });
})
