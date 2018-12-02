var mongojs = require('mongojs');

var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;
var connection = require('mongojs')(mongoURI) // mongodb.connect(mongoURI); // 

//var connection = mongojs(mongoURI,[],{authMechanism: 'ScramSHA1'});


module.exports = connection;