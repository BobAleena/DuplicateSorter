var mongodb = require('mongojs');

var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;
var connection = mongodb.connect(mongoURI);

module.exports = connection;