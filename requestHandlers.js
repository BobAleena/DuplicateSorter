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

    //form check all emails within a file
    form1 = 
      'Use this form to <strong>check emails from a file</strong>: </br>' +
      '<form action="/checkEmailList" method="POST">'+ 
      'Enter Inputfile to check: <input type="file" name="inputfile"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';
    
    //form: check for presence of a single email address
    form2 = 
      'Use this form to check <strong>a single email address: </strong></br>' +
      '<form action="/checkSingleEmail" method="POST">'+ 
      'Enter Email to check: <input type="text" name="emailAddress"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    //form: flag a single email as bounced
    form3 = 
      'Use this form to <strong>flag a single email address: </strong></br>' +
      '<form action="/emailBounced" method="POST">'+ 
      'Enter Email to flag: <input type="text" name="emailAddress"><br>'+
      'Set status:   <input type="checkbox" name="bounced" value="true"> Bounced<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';
  
    //form: remove a single email address
    form4 = 
      ' Use this form to <strong>remove a single email address</strong><br>' +
      '<form action="/removeEmailHandler" method="POST">'+ 
      'Enter email address to add: <input type="text" name="removeEmail"><br>'+
      '<input type="submit" value="Submit text" />'+
      '</form>';
  
    //form: ADD a single email address
    form5 = 
      ' Use this form to <strong>add a SINGLE email address </strong><br>' +
      '<form action="/addNewEmailAddress" method="POST">'+ 
      'Enter email address to add: <input type="text" name="emailAddress"><br>'+
      'Choose template to add:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    //form: Add a list of email addresses from a file
    form6 = 
      'Use this form to <strong>add emails from a file</strong>: </br>' +
      '<form action="/addNewList" method="POST">'+ 
      'Enter Inputfile to check: <input type="file" name="inputfile"><br>'+
      'Choose template to check for:' + templates + '<br>' +
      '<input type="submit" value="Submit text" />'+
      '</form>';

    form7 = 
      'Use this form to <strong>add a new Template</strong>: </br>' +
      '<form action="/addNewTemplate" method="POST">'+ 
      'Enter TemplateName to add: <input type="text" name="emailTemplate"><br>'+
      '<input type="submit" value="Submit text" />'+
      '</form>';

    form8 =
      'Use this form to <strong>check which emails for a template</strong>: </br>' +
      '<form action="/retrieveEmailsForTemplate" method="POST">'+ 
      'Enter TemplateName to check: <input type="text" name="emailTemplate"><br>'+
      '<input type="submit" value="Submit text" />'+
      '</form>';


    HTMLbody = form1 + form2 + form3 + form4 + form5 + form6 + form7 + form8; 
    var body =  HTMLbody
    utils.writeHTMLPage(response,body);
    }
  });

}

function retrieveEmailsForTemplate (response, postData) {
  templateToCheck = querystring.parse(postData).emailTemplate;

  utils.retrieveEmailsForTemplate(templateToCheck, function (err, emails) {
    body = "";
    if (emails != false) {
      emails.forEach(function(address) {
        body = body + "<br/>" + address.emailAddress;
      });
    } else {
      body = "no emails";
    }
    utils.writeHTMLPage(response, body);
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
    if (data) { // if there is a result
      if (templates.hasOwnProperty(templateToCheck)) {
        body = "FOUND: The email address " + emailToCheck + " exists with the email template: " +  templateToCheck + "<br>";
      } else {
        body = "NOT FOUND: The email address " + emailToCheck + " exists but the template " +  templateToCheck + " is not there";
      }
    } else { // if there is no result 
      body = "The email address " + emailToCheck + " does NOT exist";
    }
    utils.writeHTMLPage(response, body);
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
      utils.writeHTMLPage(response, templates);
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
      utils.writeHTMLPage(response, emails );
    }
  });
}

//not in use
function addFieldToDocs(response,postData) {
  
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
    var body = emails;
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
      var content = newEmails;
      utils.writeHTMLPage(response, content); 
    });
  });



}

function removeEmailHandler (response, postData) {
  //var emailsToCheck = querystring.parse(postData).emailAddress;
  var removeEmail = querystring.parse(postData).removeEmail;

  utils.removeEmailAddress(removeEmail, function (err, result) {
    if (err) { console.log("Error: " + err); console.error(err); return; }

    var content = " RemovedEmail " + removeEmail + " " + result;
    utils.writeHTMLPage(response, content); 

  });
}



function addNotesToEmail (response, postData) {

}


//Adds email to db
function addNewEmailAddress(response, postData) {

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


//Adds template to db
function addNewTemplate(response, postData) {

  // should put this into a callback so it is not blocking.
  var data;
  var templateName = querystring.parse(postData).emailTemplate;

  utils.addNewTemplate(templateName, function (err, result ) {
    if (err) {
      console.error(err);
    }
  });
  var content = "You've sent: " + querystring.parse(postData).emailTemplate + "\<br\>\<br\>" +"Input another file: \<a href\=\"\/\"\>Click here\<\/a\>";
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
      utils.writeHTMLPage(response, content);
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
      var content = newEmails;
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
exports.addNewEmailAddress = addNewEmailAddress;
exports.addNewList = addNewList;
exports.emailBounced = emailBounced;
exports.removeEmailHandler = removeEmailHandler;
exports.addNewTemplate = addNewTemplate;
exports.retrieveEmailsForTemplate = retrieveEmailsForTemplate;

