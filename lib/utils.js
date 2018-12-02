var mongodb = require('mongodb')
var querystring = require("querystring");
var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;
var templateDBName = "emailTemplates";
var emailAddressCollection = null; //, function(err, collection) {
var collection = null;
var responseCollection = null;
var templateCollection = null;
var responseDBName = "responses"
var db_singleton = require('../lib/dbConnection');


var addResponseReceivedFlag = function (emailAddress, templateName, callback) {
    if (responseCollection == null) {
      //console.log("it was null " + db_singleton + " " + dbName);
      responseCollection = db_singleton.collection(responseDBName);
    }
    //in future may want to check that template and email are existing
    
    this.emailAddressAndTemplateExists(emailAddress,templateName, function (err, emailExists, templateExists) {
      if ((err != null) || !emailExists || !templateExists)  {
        callback(err, false);
        done();
      } else {
          responseCollection.insert({"emailAddress": emailAddress,
                                    "templateName": templateName,
                                    "response":true}, function (err,newDoc) {
              if (err) { 
                console.error(err); 
                callback(err,false);
              } if (newDoc == undefined || newDoc.length == 0) {
                callback(null, false);         
              } else {
                callback(null, newDoc.response);
              }
              done(); 
            });
        }
    })
}

var checkResponseFlag = function (emailAddress, templateName, callback) {
  if (responseCollection == null) {
    //console.log("it was null " + db_singleton + " " + dbName);
    responseCollection = db_singleton.collection(responseDBName);
  }

  responseCollection.find({"emailAddress":emailAddress,
                          "templateName":templateName,
                          "response":true}, function (err,newDoc) {
       // console.log(newDoc[0].emailAddress);

        if (err != null) {
          callback(err, true);
        } else if (newDoc.length == 0) {
          callback(null,false);
        } else {
          callback(null,newDoc[0].response);
        }
      });
}

//checks for a single email address
var emailAddressExists = function(emailAddress, callback) {
    if (emailAddressCollection == null) {
      //console.log("it was null " + db_singleton + " " + dbName);
      emailAddressCollection = db_singleton.collection(dbName);
    }
    emailAddressCollection.find( { "emailAddress" : emailAddress.toLowerCase() } ).toArray( function (err, docs) {
      if (err) { console.error(err); }
      if (docs == undefined || docs.length == 0) {
        callback(null, false, {});         
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
    //var db2 = db.db(dbName);
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
  console.log('got here ' + mongoURI + '...');
  mongodb.connect(mongoURI, function (err, db) {  
    console.error(mongoURI);
    console.error("db is... " + db);
    if (err)
      { console.error(err); response.send("Error " + err); }
    var collection = db.collection(dbName);    
    collection.find().toArray(callback); 
  });

}

var addNewDoc = function (emailAddress, templateName, callback) {
  if (emailAddressCollection == null) {
  //console.log("it was null ");
  //console.log(db_singleton + " " + dbName);
    emailAddressCollection = db_singleton.collection(dbName);
  }

  emailAddressExists (emailAddress, function (err, flag, templates) {
    var nestedDocs = {}
    if (flag) { //exists
      if (templates[templateName]==1) {  //if template exists
        callback(err, false) //return false because already exists
      } else {  // template does not exist
        nestedDocs = templates;
        nestedDocs[templateName] = 1;
        var doc1 = {"emailAddress": emailAddress.toString().toLowerCase(), "EmailsSent" : nestedDocs};
        emailAddressCollection.update(
             {"emailAddress":emailAddress.toString().toLowerCase() },
             {
              $set: {"emailAddress": emailAddress.toString().toLowerCase(), "EmailsSent" : nestedDocs }
             }, 
             function(err, result) {
               callback(err, result);        
             }
        )
      } 
    } else { //does not exist
      nestedDocs[templateName] = 1;
      var doc1 = {"emailAddress": emailAddress.toString().toLowerCase(), "EmailsSent" : nestedDocs};
      emailAddressCollection.insert(doc1, {w:1}, function(err, result) {
        callback(err, result);        
      });
    }
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

var getAllTemplatesForEmail = function(emailToCheck, callback) {
  if (emailAddressCollection == null) {
    emailAddressCollection = db_singleton.collection(dbName);
  }
  field = "emailAddress";
  returnfields = "EmailsSent";
  query = {}
  queryFilter = {}
  query[field] = emailToCheck; // this is the field being queried on
  queryFilter[returnfields] = 1; // this says to return this field
  //console.log(query);
  emailAddressCollection.find(query, queryFilter).toArray(function (err,docs) {
    if (err) {console.error(err); }
    if (docs.length == 0) {
      callback(null, false);         
    } else {
      //parsed = JSON.parse(docs[0].EmailsSent);
      console.log('...');
     // console.log(parsed);
      callback(null, docs[0].EmailsSent);
    } 
  })
  return;
}

var getAllEmails = function (callback) {
  callback (true);
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
    console.log(returnArray);

  return returnArray;
}

//creates HTML formated respnse data
function writeHTMLPage(response, content) {
 // if (err) { console.error(err); response.send("Error " + err); }
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(getHTMLHead() + content + getHTMLClose());
  response.end();
}

function writeMoreHTML(response, content) {
  response.write(content.toString());
}



exports.getAllTemplatesForEmail = getAllTemplatesForEmail;
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
exports.getAllEmails = getAllEmails;
exports.addResponseReceivedFlag = addResponseReceivedFlag;
exports.checkResponseFlag = checkResponseFlag;
exports.writeMoreHTML = writeMoreHTML;
