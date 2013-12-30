var http = require("http");
var url = require("url");

function startSorterServer(route, handle) {
  console.log("SorterServer started");

  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      //console.log("Received POST data chunk '"+ postDataChunk + "'.");
    });


    request.addListener("end", function() {
      route(handle, pathname, response, postData); // pass pathname to the function passed in above
      //console.log("Am in the end function." + postData);
    });

  }

  http.createServer(onRequest).listen(8888); //this is the function defined above. Could have been called inline

}

exports.start = startSorterServer;