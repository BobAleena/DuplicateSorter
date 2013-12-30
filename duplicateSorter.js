var server = require("./duplicateSorterServer");
var router = require("./router");
var requestHandlers = require("./requestHandlers");


var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload; 


// Note! you can pass a function in anonymously here too!

server.start(router.route, handle);



// an alternate way to do the above is pass the function inline
// example: 
// 
// server.start(function(pathname) {
// 	console.log("I'm in the request for " + pathname);
//   });
