var MongoClient = require('mongodb').MongoClient;
var dbConfig = require('./db.json').db;
var async = require('async');



module.exports = function(data) {

	async.waterfall([function(callback) {
			MongoClient.connect(dbConfig.url, function(err, db) {
				callback(null, db);
			});

		}, function(db, callback) {
			var col = db.collection('router');

			col.updateOne({
					macAddress: data.MACAddress
				}, {
					$push: {
						'details': {
							'updatedDate': new Date(),
							'details': data
						}
					}

				}, {
					upsert: true
				},
				function(err, results) {
					callback(null, err, results, db);
				});
		}, function(err, results, db, callback) {
			if (err) {
				callback(err)
			} else {
				console.log("Success:Closing DB.");
				console.log(results.result);
			}
			db.close();
			callback(null, 'done');
		}],
		function(err, results) {
			if (err) {
				console.log(err);
			} else {
				console.log(results);
			}
		});
	return;
}
