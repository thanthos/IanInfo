'use strict'
var cheerio = require('cheerio');

var EPC3825 = function() {
    this.model = 'EPC3825';
    this.brand = 'CISCO';
}

/*
@ htmlBody : The html page to be check against.
@ callback : return a text message to indicate Login Successful or not. 

*/
EPC3825.prototype.checkLogin = function(htmlBody, callback) {
    var $ = cheerio.load(htmlBody);
    var page = $("html head title").text();

    if (page == 'About') {
        if (callback) callback('Login Unsuccessfull');
        return false;
    } else {
        if (callback) callback(null, 'Login Successful');
        return true;
    }
}

EPC3825.prototype.parseLandingPage = function(htmlBody, callback) {

    var $ = cheerio.load(htmlBody);
    var dataSet = $("table.nav * table.std[summary]");
    var modemInfoDataSet = dataSet.find("td");
    var modem = {};

    try {
        for (var i = 0; i < $(modemInfoDataSet).length; i++) {

            var node = $(modemInfoDataSet)[i];
            if ($(node).attr('headers') != null) {
                modem[$(node).attr('headers')] = $(node).text().trim();
            }
        }
    } catch (error) {
        if (callback) callback(error);
    }

    if (callback) {
        callback(null, modem);
    }
    return modem;
};

EPC3825.prototype.parseLANStatus = function(htmlBody, callback) {
    var $ = cheerio.load(htmlBody);
    var dataSet = $("table.nav * table.std[summary]").find("td");
    var lanStatus = {};

    try {
        for (var i = 0; i < $(dataSet).length; i++) {
            var node = $(dataSet)[i];
            if ($(node).attr('headers') != null) {
                lanStatus[$(node).attr('headers')] = $(node).text().trim();
            }
        }
    } catch (error) {
        if (callback) callback(error);
    }

    if (callback) {
        callback(null, lanStatus);
    }
    console.log("---------------------");
    console.log(lanStatus);
    console.log("---------------------");
    return lanStatus;
};

EPC3825.prototype.parseWANStatus = function(htmlBody, callback) {
    var $ = cheerio.load(htmlBody);
    var dataSet = $("table.nav * table.std[summary]").find("td");
    var wanStatus = {};

    try {
        for (var i = 0; i < $(dataSet).length; i++) {

            var node = $(dataSet)[i];
            if ($(node).attr('headers') != null) {
                wanStatus[$(node).attr('headers')] = $(node).text().trim();
            }
        }
    } catch (error) {
        if (callback) callback(error);
    }

    if (callback) {
        callback(null, wanStatus);
    }
    console.log("---------------------");
    console.log(wanStatus);
    console.log("---------------------");
    return wanStatus;
};

EPC3825.prototype.parseWLANStatus = function(htmlBody, callback) {
    var $ = cheerio.load(htmlBody);
    var dataSet = $("table.nav * table.std[summary]").find("td");
    var wlanStatus = {};

    try {
        for (var i = 0; i < $(dataSet).length; i++) {

            var node = $(dataSet)[i];
            if ($(node).attr('headers') != null) {
                wlanStatus[$(node).attr('headers')] = $(node).text().trim();
            }
        }
    } catch (error) {
        if (callback) callback(error);
    }

    if (callback) {
        callback(null, wlanStatus);
    }
    console.log("---------------------");
    console.log(wlanStatus);
    console.log("---------------------");
    return wlanStatus;
};

module.exports = new EPC3825();
