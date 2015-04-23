var server = require("./duplicateSorterServer");
var router = require("./router");
var requestHandlers = require("./requestHandlers");


var handle = {}

//retrieves start page
handle["/"] = requestHandlers.start;

//retrieves all emails in db
handle["/getEmails"] = requestHandlers.getEmails;

// returns true/false if single email + template exists in db
handle["/checkSingleEmail"] = requestHandlers.checkSingleEmail;

// checks a list of emails, returns list of emails not in db 
handle["/checkEmailList"] = requestHandlers.checkEmailList;  

// adds a single new email to db
handle["/addNewDoc"] = requestHandlers.addNewDoc; 

// add a list of new emails to db 
handle["/addNewList"] = requestHandlers.addNewList;

server.start(router.route, handle);

