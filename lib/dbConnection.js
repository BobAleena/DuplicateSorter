var mongojs = require('mongojs');

var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;
var connection = require('mongojs')(mongoURI) // mongodb.connect(mongoURI); // 

module.exports = connection;