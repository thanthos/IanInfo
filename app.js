'use strict'

var request = require("request");
var cheerio = require('cheerio');
var JSON = require('JSON');
var config = require('./config.json');
var bunyan = require('bunyan');
var async = require('async');
var log = bunyan.createLogger({
    name: 'stock_search',
    streams: [{
        path: './logs/checkLog.log',
        level: 'debug'
    }, {
        stream: process.stderr,
        level: "debug"
    }]
});

var j = request.jar();
var request = request.defaults({
    jar: true,
    followRedirect: true
})

function loadStartPage(config, cookie) {
    log.debug("loading start page");
    request({
            "uri": config.start_url,
            "jar": cookie
        }, function(err, response, body) {
            // Hand the HTML response off to Cheerio and assign that to
            //  a local $ variable to provide familiar jQuery syntax.
            log.debug("Obtained response. Error? %s", err);
            if (err && response.statusCode !== 200) {
                log.error('Unable to get Data from Source.');
            } else {
                var $ = cheerio.load(body);
                var dataSet = $("table.nav * table.std[summary]");
                var modemInfoDataSet = dataSet.find("td");
                var modem = {};
                for (var i = 0; i < $(modemInfoDataSet).length; i++) {
                    var node = $(modemInfoDataSet)[i];
                    if ($(node).attr('headers') != null) {
                        modem[$(node).attr('headers')] = $(node).text()
                            .trim());
                }

            }


            // console.log("----------------");
            //console.log(cookie);
        }
    });
};

function performLogin(config, cookie) {
    request.post({
            "uri": config.login_action,
            "jar": cookie,
            "form": {
                "username_login": config.login.username,
                "password_login": config.login.password
            }
        },
        function(err, response, body) {
            // console.log("----------------");
            // console.log(err);
            // console.log("----------------");
            log.info("Perform Login: " + response.statusCode);
            // console.log(body);
            // console.log("----------------");
            if (err && response.statusCode !== 200) {
                log.error('Unable to get Data from Source.');
            } else if (response.statusCode === 302) {
                log.info("Doing Redirect: %s", response.headers.location);
                request({
                    "uri": config.gatewayStatus,
                    "jar": cookie
                }, function(error, res, b) {
                    console.log("Redirect Status %s ", res.statusCode);
                    if (error && res.statusCode !== 200) {
                        log.error(
                            'In the redirect Unable to get Data from Source.'
                        );
                    } else {
                        var $ = cheerio.load(b);
                        var dataSet = $(
                            "table.dataTable * table.nav"
                        );

                        var gatewayInfo = $(dataSet[0]).find(
                            "[summary]").children("*");
                        var ipV4Info = $(dataSet[1]).find(
                            "[summary]").children("*");

                        console.log($(gatewayInfo).find('td').not(
                            'script').length);

                        for (var i = 0; i < $(gatewayInfo).find(
                                'td').length; i++) {
                            var node = $(gatewayInfo).find('td')
                                .not('script')[
                                    i];
                            console.log("--------------");
                            console
                                .log("Header :: " + $(node).attr(
                                    'headers'));

                            console.log($(node).text());
                            console
                                .log("--------------");
                        }


                    }
                });
            } else {
                // supposedlly the redirect should work
                // However the redirect does not load
                // We code the above if else to hand the
                // redirect
            }
        });
}

function getLanInfo(config, cookie) {


}
loadStartPage(config, j);
//performLogin(config, j);
