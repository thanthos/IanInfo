'use strict'

var request = require("request");
var cheerio = require('cheerio');
var JSON = require('JSON');
var config = require('./config.json');
var modelCatalog = require('./routers/modelConfig.json');
var bunyan = require('bunyan');
var async = require('async');
var log = bunyan.createLogger({
    name: 'routerChecker',
    streams: [{
        path: './logs/checkLog.log',
    }, {
        stream: process.stderr,
    }]
});

var cookie = request.jar();
var request = request.defaults({
    jar: true,
    followRedirect: true
})



/*
 * The method load up the default page and return the modem information
 * @param config - The configuration Object storing the URL, etc
 * @param cookiejar - The cookie jar to store the cookie
 * @param callback - returns err and the modem details.
 */

function loadStartPage(config, model, cookie, callback) {
    log.debug("URI: %s", (config.protocol + "://" + config.router_address +
        config.landingPage));
    try {
        request({
            "uri": config.protocol + "://" + config.router_address +
                config.landingPage,
            "jar": cookie
        }, function(err, response, body) {
            if (err && response.statusCode !== 200) {
                log.error('Unable to get Data from Source.');
                callback(err);
            } else {
                log.debug("Success: $s");
                model.parseLandingPage(body, callback);
            }
        });
    } catch (e) {
        callback(e);
    }
    return;
};

/*
 * The method Perform Login
 * @param config - The configuration Object storing the URL, etc
 * @param cookiejar - The cookie jar to store the cookie
 * @param callback - returns err and the modem details.
 */

function login(config, model, cookie, callback) {
    log.debug("Login Request URI %s", (config.protocol + "://" + config.router_address +
        config.login_action));
    request.post({
            "uri": config.protocol + "://" + config.router_address +
                config.login_action,
            "jar": cookie,
            "form": {
                "username_login": config.username,
                "password_login": config.password
            }
        },
        function(err, response, body) {
            if (err && response.statusCode !== 200) {
                log.error('Unable to get Data from Source. %s', err);
                callback(err);
            } else if (response.statusCode === 302) {
                log.info("Being redirect: %s", response.headers.location);
                log.info("Cookie : %j", cookie)
                request({
                    uri: response.headers.location
                }, function(err, response, body) {
                    model.checkLogin(body, callback);
                })
            } else {
                log.info("Cookie : %j", cookie)
                model.checkLogin(body, callback);
            }
        });
}

function lanStatus(config, model, cookie, callback) {
    log.debug("URI: %s", (config.protocol + "://" + config.router_address +
        config.lanStatus));
    try {
        request({
            "uri": config.protocol + "://" + config.router_address +
                config.lanStatus,
            "jar": cookie
        }, function(err, response, body) {
            if (err && response.statusCode !== 200) {
                log.error(
                    'Unable to get Data from Source.'
                );
                callback(err);
            } else {
                log.trace("responseBody:", body);
                model.parseLANStatus(body, callback);
            }
        });
    } catch (e) {
        callback(e);
    }
    return;
}

function wlanStatus(config, model, cookie, callback) {
    log.debug("URI: %s", (config.protocol + "://" + config.router_address +
        config.wlanStatus));
    try {
        request({
            "uri": config.protocol + "://" + config.router_address +
                config.wlanStatus,
            "jar": cookie
        }, function(err, response, body) {
            log.debug("Obtained response. Error? %s",
                err);
            if (err && response.statusCode !== 200) {
                log.error(
                    'Unable to get Data from Source.'
                );
                callback(err);
            } else {
                model.parseWLANStatus(body, callback);
            }
        });
    } catch (e) {
        callback(e);
    }
    return;
}

function wanStatus(config, model, cookie, callback) {
    log.debug("URI: %s", (config.protocol + "://" + config.router_address +
        config.wanStatus));
    try {
        request({
            "uri": config.protocol + "://" + config.router_address +
                config.wanStatus,
            "jar": cookie
        }, function(err, response, body) {
            log.debug("Obtained response. Error? %s",
                err);
            if (err && response.statusCode !== 200) {
                log.error(
                    'Unable to get Data from Source.'
                );
                callback(err);
            } else {
                model.parseWANStatus(body, callback);
            }
        });
    } catch (e) {
        callback(e);
    }
    return;
}



//Start Checking
log.info("Start Time %s", new Date());
var unitArray = config.check;
for (var i in unitArray) {
    log.info("Checking Router. Model: %s@%s", unitArray[i].model,
        unitArray[i].router_address);
    var config = unitArray[i];
    var router = null;
    try {
        for (var j in modelCatalog) {

            if (modelCatalog[j].model == config.model) {
                router = require("./routers/EPC3825");
                for (var k in modelCatalog[j]) {
                    config[k] = modelCatalog[j][k];
                }
                log.debug("Checking on Router %s", router ==
                    null ? "Absent" :
                    "Present");
                break;
            }
        }
        if (router == null) throw "ERR1: Router not supported";

        log.info("Configured Data %s", JSON.stringify(config));

        async.series([
            function(callback) {
                log.debug("In Async %s", JSON.stringify(
                    config));
                loadStartPage(config, router, cookie,
                    callback);
            },
            function(callback) {
                login(config, router, cookie, callback);
            },
            function(callback) {
                lanStatus(config, router, cookie,
                    callback);
            },
            function(callback) {
                wlanStatus(config, router, cookie,
                    callback);
            },
            function(callback) {
                wanStatus(config, router, cookie,
                    callback);
            },
        ], function(err, results) {
            if (err) {
                log.error("Error Processing %s", err);
            } else {
                log.info("%j", results);
            }

        });

    } catch (error) {
        log.error(error);
    }
}
