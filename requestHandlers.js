var mongodb = require('mongodb')
var querystring = require("querystring");
var utils = require("./lib/utils.js");
var async = require("async");

    
fs = require ("fs");

var mongoURI = process.env.MONGOLAB_URI;
var dbName = process.env.dbName;

// This is the initial page. Asks for two parameters, source file and template to check
function start(response, postData) { 
  var emails = "<br>";
  var HTMLbody = "";
  var form1, form2, form3, form4 = "";
  var templates = "<select name=\"emailTemplate\">";

  utils.retrieveAllDocs('emailTemplates',function(err, docs) {
    if (err) 
      { console.error(err); response.send("Error " + err); }
    else {
      docs.forEach (function (doc) {
        templates = templates + "<option value=\"" + (doc.templateName) + "\">" + doc.templateName +"</option>";
      });
    templates = templates + "<option value=\"testtemplate\">TestTemplate</option>";

    templates = templates + "</select>";
    form1 = 
      'Use this form to <strong>check emails from a file</strong>: </br>' +
      '<form action="/checkEmailList" method="POST">'+ 
      'Enter Inputfile to check: <input type="file" name="inputfile"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    form2 = 
      'Use this form to check <strong>a single email address: </strong></br>' +
      '<form action="/checkSingleEmail" method="POST">'+ 
      'Enter Email to check: <input type="text" name="emailAddress"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    form3 = 
      'Use this form to <strong>flag a single email address: </strong></br>' +
      '<form action="/emailBounced" method="POST">'+ 
      'Enter Email to flag: <input type="text" name="emailAddress"><br>'+
      'Set status:   <input type="checkbox" name="bounced" value="true"> Bounced<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';
  
    form4 = 
      ' Use this form to <strong>remove a single email address</strong><br>' +
      '<form action="/removeEmailHandler" method="POST">'+ 
      'Enter email address to add: <input type="text" name="removeEmail"><br>'+
      '<input type="submit" value="Submit text" />'+
      '</form>';
  
    form5 = 
      ' Use this form to <strong>add a SINGLE user </strong><br>' +
      '<form action="/addNewDoc" method="POST">'+ 
      'Enter email address to add: <input type="text" name="emailAddress"><br>'+
      'Choose template to add:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    form6 = 
      'Use this form to <strong>add emails from a file</strong>: </br>' +
      '<form action="/addNewList" method="POST">'+ 
      'Enter Inputfile to check: <input type="file" name="inputfile"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>' +  utils.getHTMLClose();

    HTMLbody = form1 + form2 + form3 + form4 + form5 + form6; 
    var body =  utils.getHTMLHead() + HTMLbody
    utils.writeHTMLPage(response,body);
    }
  });

}

// This is the initial page. Asks for two parameters, source file and file to check.
function checkSingleEmail(response, postData) { 
  emailToCheck = querystring.parse(postData).emailAddress;//, 'utf8', function (err, data) {
  templateToCheck = querystring.parse(postData).emailTemplate;
  var body = "";
  utils.emailAddressExists(emailToCheck, function (err, data, templates ) {
    if (err) {
      return console.log("Error: " + err);
    }
    if (data) {
      if (templates.hasOwnProperty(templateToCheck)) {
        body = "FOUND: The email address " + emailToCheck + " exists with the email template: " +  templateToCheck + "<br>";
      } else {
        body = "NOT FOUND: The email address " + emailToCheck + " exists but the template " +  templateToCheck + " is not there";
      }
    } else {
      body = "The email address " + emailToCheck + " does NOT exist";
    }
    utils.writeHTMLPage(response, utils.getHTMLHead() + body + utils.getHTMLClose());
  });
}


function getEmailTemplates (response, postData) {
  var templates = "";
    
  utils.retrieveAllDocs('emailTemplates',function(err, docs) {
    if (err) 
      { console.error(err); response.send("Error " + err); }
    else {
      docs.forEach (function (doc) {
        templates = templates + (doc.templateName) + '<br>';
      });
      utils.writeHTMLPage(response, utils.getHTMLHead() + templates + utils.getHTMLClose());
    }
  });
}



function getEmails (response, postData) {
  var emails = "";
  utils.retrieveAllDocs(dbName, function(err, docs) {
    if (err)
      { console.error(err); response.send("Error " + err); }
    else {
      docs.forEach (function (doc) { 
        emails = emails + (JSON.stringify(doc))+ '<br>'; 
      });
      utils.writeHTMLPage(response, utils.getHTMLHead() + emails + utils.getHTMLClose());
    }
  });
}

//not in use
function addFieldToDocs(response,postData) {
  
  var HTMLhead = utils.getHTMLHead();
  var HTMLbody = utils.getHTMLClose();

  mongodb.connect(mongoURI, function (err, db) {
      
    if (err)
      { console.error(err); response.send("Error " + err); }
    var emails = '';
    var collection = db.collection('emailAddresses'); //, function(err, collection) {     
    var newField = {"EmailsSent" : { "UpdateEmail" : 1 } };
    collection.update({}, {$set : newField }, { multi:true }, function (err, result) { 
      if (err) 
        { console.error(err); response.send("Error" + err); }
    });
    var body = HTMLhead + emails + HTMLbody;
    utils.writeHTMLPage(response,body);
    
  })
}

function emailBounced (response, postData) {
  //var emailsToCheck = querystring.parse(postData).emailAddress;
  var bouncedVal = (querystring.parse(postData).bounced === 'true');

  /*utils.updateEmail (emailToCheck, bouncedVal, dbName, function (err) {
    if (err)
       { console.error(err); response.send("Error " + err); }

    var body = utils.getHTMLHead() + 'Updated ' + emailToCheck + 'to be ' + bouncedVal + utils.getHTMLClose();
    utils.writeHTMLPage(response,body);

  });*/

  fs.readFile("./tmp/" + querystring.parse(postData).emailAddress, 'utf8', function (err,data) {
    if (err) { console.log("Error: " + err); console.error(err); return; }

    var emailArray = utils.getEmailsFromString(data)   // puts input from read file into array

    utils.updateEmail(emailArray, bouncedVal, dbName, function (err, newEmails) {
      var content = utils.getHTMLHead() + newEmails + utils.getHTMLClose();
      utils.writeHTMLPage(response, content); 
    });
  });



}

function removeEmailHandler (response, postData) {
  //var emailsToCheck = querystring.parse(postData).emailAddress;
  var removeEmail = querystring.parse(postData).removeEmail;

  utils.removeEmailAddress(removeEmail, function (err, result) {
    if (err) { console.log("Error: " + err); console.error(err); return; }

    var content = utils.getHTMLHead() + " RemovedEmail " + removeEmail + " " + result + utils.getHTMLClose();
    utils.writeHTMLPage(response, content); 

  });
}



function addNotesToEmail (response, postData) {

}


//Adds email to db
function addNewDoc(response, postData) {

  // should put this into a callback so it is not blocking.
  var data;
  var templateName = querystring.parse(postData).emailTemplate;
  var newEmail = querystring.parse(postData).emailAddress;

  var duplicateEmailStream = fs.createWriteStream("./tmp/duplicates.txt",{'flags': 'a'});

  utils.emailAddressAndTemplateExists(newEmail, templateName, function (err, emailExists, templateExists ) {
    if (emailExists && templateExists) {
      duplicateEmailStream.write("Duplicate: " + newEmail + "\r\n");  // prepends with 'DUPLICATE' - in future put in new file
    } else if (emailExists && !templateExists) {
      console.log('template does not exist');
    } else {
      utils.addNewDoc(newEmail, templateName, function(err, result) {});            
    } 
  });
  var content = "You've sent: " + querystring.parse(postData).emailAddress + "\<br\>\<br\>" +"Input another file: \<a href\=\"\/\"\>Click here\<\/a\>";
  utils.writeHTMLPage(response, content);
}  



//Adds emails to db == needs to be updated to update in one call
function addNewList(response, postData) {

  // should put this into a callback so it is not blocking.
  var data;
  var templateName = querystring.parse(postData).emailTemplate;
  var newEmails = "";
  var existingCount = 0;
  var newCount = 0;
  // read input file containing new emails and put into variable data
  fs.readFile("./tmp/" + querystring.parse(postData).inputfile, 'utf8', function (err,data) {
    if (err) {
      return console.log("Error: " + err);
    }      

    var emailArray = utils.getEmailsFromString(data)   // puts input from read file into array

    var duplicateEmailStream = fs.createWriteStream("./tmp/duplicates.txt",{'flags': 'a'});

    async.eachSeries(emailArray, function(entry, cb) {   
     //emailArray.forEach( function(entry) {        // check each item in array (these are the potential new emails)
      utils.emailAddressAndTemplateExists(entry, templateName, function (err, emailExists, templateExists ) {
        if (emailExists && templateExists) {
          duplicateEmailStream.write("Duplicate: " + entry + "\r\n");  // prepends with 'DUPLICATE' - in future put in new file
          existingCount++;
          cb();
        } else if (emailExists && !templateExists) {
          console.log('template does not exist');
          cb();
        } else {
          utils.addNewDoc(entry, templateName, function(err, result) {
            newEmails = newEmails + entry + "</br>";
            newCount++
            cb();
          });     
        } 
      });
    }, function (err) {
      if (err) { throw err; }
      var content = "You've sent: " + querystring.parse(postData).inputfile + "\<br\>\<br\>" + 
        "The number of duplicates: " + existingCount + ". Number of New: " + newCount + "</br>" +
        newEmails;
      utils.writeHTMLPage(response, utils.getHTMLHead() + content + utils.getHTMLClose());
    });
  });
  
}  



//Adds email to db
function checkEmailList(response, postData) {

  // should put this into a callback so it is not blocking.
  var data;
  var templateName = querystring.parse(postData).emailTemplate;
  // read input file containing new emails and put into variable data
  fs.readFile("./tmp/" + querystring.parse(postData).inputfile, 'utf8', function (err,data) {
    if (err) { console.log("Error: " + err); console.error(err); return; }

    var emailArray = utils.getEmailsFromString(data)   // puts input from read file into array

    checkAll(emailArray, templateName, function (newEmails) {
      var content = utils.getHTMLHead() + newEmails + utils.getHTMLClose();
      utils.writeHTMLPage(response, content); 
    });
  });
}  

var checkAll = function(emailArray, templateName, callback) {
  var newEmails = "";
  var existingCount = 0;
  var newCount = 0;
  var duplicateEmailStream = fs.createWriteStream("./tmp/duplicates.txt",{'flags': 'a'});

  async.eachSeries(emailArray, function(entry, cb) {        // check each item in array (these are the potential new emails)
    utils.emailAddressAndTemplateExists(entry.toString().toLowerCase(), templateName, function (err, emailExists, templateExists ) {
      if (emailExists) {
        if (templateExists) {
          ++existingCount;
          duplicateEmailStream.write("Duplicate: " + entry + "\r\n");  // prepends with 'DUPLICATE' - in future put in new file    } else if (emailExists && !templateExists) {
        } else {
          console.log('template does not exist');
        }
      } else {
        ++newCount;
        newEmails = newEmails + entry + "</br>";
      }
    cb();
    });
  }, function (err) {
    if (err) { throw err; }
    callback("The number of duplicates: " + existingCount + ". Number of New: " + newCount + "</br>" + newEmails);
  });
}


exports.start = start;
exports.getEmails = getEmails;
exports.addFieldToDocs = addFieldToDocs;
exports.checkSingleEmail = checkSingleEmail;
exports.checkEmailList = checkEmailList;
exports.addNewDoc = addNewDoc;
exports.addNewList = addNewList;
exports.emailBounced = emailBounced;
exports.removeEmailHandler = removeEmailHandler;
