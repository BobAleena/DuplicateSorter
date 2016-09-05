var mongodb = require('mongodb')
var querystring = require("querystring");
var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;
var templateDBName = "emailTemplates";
var emailAddressCollection = null; //, function(err, collection) {
var collection = null;
var templateCollection = null;
var db_singleton = require('../lib/dbConnection');

//checks for a single email address
var emailAddressExists = function(emailAddress, callback) {
    if (emailAddressCollection == null) {
      //console.log("it was null " + db_singleton + " " + dbName);
      emailAddressCollection = db_singleton.collection(dbName);
    }
    emailAddressCollection.find( { "emailAddress" : emailAddress.toLowerCase() } ).toArray( function (err, docs) {
      if (err) { console.error(err); }
      if (docs.length == 0) {
        callback(null, false, docs.EmailsSent);         
      } else {
        doc = docs[0];
        callback(null, true, doc.EmailsSent);
      } 
    });
} 

var emailAddressAndTemplateExists = function (emailAddress, templateName, callback) {
  emailAddressExists(emailAddress, function (err, returnVal, templates) {
    if (returnVal) {
      if (templates != null) {
        callback (null, true, templates.hasOwnProperty(templateName)) // email exists, checking for templateName
      } else {
        callback (null, true, false); // email exists, no templates at all exist
      }
    } else {
      callback (null, false, false); // email does not exist, templates must be false
    }
  });
}


var fieldExists = function(field, callback) {
  mongodb.connect(mongoURI, function (err, db) {    
    if (err)
      { console.error(err); response.send("Error " + err); }

    //var SearchString = field.toString().toLowerCase();
    var collection = db.collection(dbName); //, function(err, collection) {
    collection.find( field ).count( function (err, count)  {
      if (err) { callback(err, null) }
      if (count == 0) {
        callback(null, false);         
      } else {
        callback(null, true);
      }
    });
  });
} 

var retrieveAllDocs = function (dbName, callback) {
  mongodb.connect(mongoURI, function (err, db) {  
    if (err)
      { console.error(err); response.send("Error " + err); }
    var collection = db.collection(dbName);    
    collection.find().toArray(callback); 
  });
}

var addNewDoc = function (emailAddress, templateName, callback) {
  if (emailAddressCollection == null) {
  //console.log("it was null " + db_singleton + " " + dbName);
    emailAddressCollection = db_singleton.collection(dbName);
  }

  var nestedDoc = {}
  nestedDoc[templateName] = 1;

  var doc1 = {"emailAddress": emailAddress.toString().toLowerCase(), "EmailsSent" : nestedDoc};
  emailAddressCollection.insert(doc1, {w:1}, function(err, result) {
     //collection.update({"emailAddress":1}, {$set:{fieldtoupdate:2}}, {w:1}, function(err, result) {}); 
     callback(err, result);        
  });
} 

var updateEmail = function (addresses, bouncedVal, dbName, callback) {
  if (emailAddressCollection == null) {
      emailAddressCollection = db_singleton.collection(dbName);
  }


  var newField = {"Bounced" : bouncedVal };
  
  addresses.forEach(function(address) {     
    emailAddressCollection.update({"emailAddress":address}, 
                                  {$set : newField }, {upsert:false, multi:false, writeConcern: {w:"majority"}},
                                  function (err, result) { 
      if (err) {
        callback(err, null);
      }
    //console.log("made it5.." + JSON.stringify(result));
    });
  });  
  callback(null, addresses);
}


var addNewTemplate = function (templateName, callback) {
  if (templateCollection == null) {
    templateCollection = db_singleton.collection(templateDBName);
  }

  var doc1 = {"templateName" : templateName};
  templateCollection.insert(doc1, {w:1}, function(err, result) {
     callback(err, result);        
  });
}

var removeTemplate = function (templateName, callback) {
  if (templateCollection == null) {
    templateCollection = db_singleton.collection(templateDBName);
  }

  templateCollection.remove({"templateName":templateName}, function(err, result) {
    if (err) { 
      console.error(err);
      callback(err, null) 
    } else {
      if (result.n == 1) {
        callback(null, true);
      }
      else {
        callback (null, false);
      }
      //callback("Something went wrong", null);
    }

  });
}

var removeEmailAddress = function (address, callback) {
  if (emailAddressCollection == null) {
      emailAddressCollection = db_singleton.collection(dbName);
  }
  
  emailAddressCollection.remove({"emailAddress":address.toString().toLowerCase()}, function(err,result) {
    if (err) { 
      callback(err, null) 
    } else {
      if (result.n == 1) {
        callback(null, true);
      }
      else {
        callback (null, false);
      }
      //callback("Something went wrong", null);
    }

  });
}

var retrieveEmailsForTemplate = function (templateName, callback) {
  if (emailAddressCollection == null) {
      //console.log("it was null " + db_singleton + " " + dbName);
    emailAddressCollection = db_singleton.collection(dbName);
  }

  field = "EmailsSent." + templateName;
  console.log(field)

  query = {};
  query[field] = 1
  emailAddressCollection.find(query).toArray(function (err, docs) {
      if (err) { console.error(err); }
    if (docs.length == 0) {
      callback(null, false);         
    } else {
      callback(null, docs);
    } 
  });
}



function getHTMLHead() {
  var HTMLhead = '<html>'+
      '<head>'+
      '<meta http-equiv="Content-Type" content="text/html; '+
      'charset=UTF-8" />'+
      '<title>'+
      'Email Duplicate Sorter'+
      '</title>'+
      '</head>'+
      '<body>';
  return HTMLhead;
}

function getHTMLClose() {
  var HTMLClose = 
    '</body>'+
    '</html>';
  return HTMLClose
}

function getEmailsFromString(input) {
  var returnArray = [];
  var match;

//  algorithm -- while input still has a email, put the email into returnArray, remove it from input, and look for another.
  while (match = input.match(/[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/)) {
    returnArray.push(match[0]); // add match to array
    input = input.replace(match[0],""); // remove match from input
  }    
  return returnArray;
}

//creates HTML formated respnse data
function writeHTMLPage(response, content) {
 // if (err) { console.error(err); response.send("Error " + err); }
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(getHTMLHead() + content + getHTMLClose());
  response.end();
}


exports.emailAddressExists = emailAddressExists;
exports.emailAddressAndTemplateExists = emailAddressAndTemplateExists;
exports.fieldExists = fieldExists;
exports.retrieveAllDocs = retrieveAllDocs;
exports.addNewDoc = addNewDoc;
exports.getHTMLHead = getHTMLHead;
exports.getHTMLClose = getHTMLClose;
exports.getEmailsFromString = getEmailsFromString;
exports.writeHTMLPage = writeHTMLPage;
exports.updateEmail = updateEmail;
exports.removeEmailAddress = removeEmailAddress;
exports.addNewTemplate = addNewTemplate;
exports.removeTemplate = removeTemplate;
exports.retrieveEmailsForTemplate = retrieveEmailsForTemplate;