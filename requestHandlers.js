var querystring = require("querystring");
    fs = require ("fs");

// This is the initial page. Takes two parameters, source file and file to check.
function start(response, postData) { 
  //console.log("Request handler 'start' was called.");
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" method="post">'+
    'Baseline File: <input type="text" name="baselinefile"><br>'+
    'Input File: <input type="text" name="inputfile"><br>'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';

    writeHTMLPage(response,body);
}







function upload(response, postData) {

  // should put this into a callback so it is not blocking.
  var data;

  // read file with original emails that are to be checked against and put into variable originaldata
  fs.readFile("./tmp/" + querystring.parse(postData).baselinefile, 'utf8', function (_err, originaldata) {
    if (_err) {
      return console.log("Error: " + _err);
    }
 
    // read input file containing new emails and put into variable data
    fs.readFile("./tmp/" + querystring.parse(postData).inputfile, 'utf8', function (err,data) {
      if (err) {
        return console.log("Error: " + err);
      }

      // create file to output to -- currently wipes out existing contents before each request.
 
      var emailArray = GetEmailsFromString(data)   // puts input from read file into array
      originaldata = originaldata.toLowerCase();   // put to lowercase to make matching easier - this is expensive

      var newEmailsStream = fs.createWriteStream("./tmp/newEmails.txt",{'flags': 'a'});
      var duplicateEmailStream = fs.createWriteStream("./tmp/duplicates.txt",{'flags': 'a'});

      emailArray.forEach( function(entry) {        // check each item in array (these are the potential new emails)
        if (originaldata.indexOf(entry.toString().toLowerCase()) == -1) { // check if the item exists in the original
          newEmailsStream.write(entry + "\r\n");  // if it doesn't write it on a new line in the output.
        } else {
          duplicateEmailStream.write("Duplicate: " + entry + "\r\n");  // prepends with 'DUPLICATE' - in future put in new file
        }
      });
    newEmailsStream.end();  //close the file
    duplicateEmailStream.end();

  });
});

  var content = "You've sent: " + querystring.parse(postData).inputfile + "\<br\>\<br\>" +"Input another file: \<a href\=\"\/\"\>Click here\<\/a\>";
  writeHTMLPage(response, content);

}


function writeHTMLPage(response, content) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(content);
  response.end();
}




function show(response, postData) {
  //console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error,file) {
    if(error) {
      writeHTMLPage(response,error);
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file,"binary");
      response.end();
    }
  });
}







function GetEmailsFromString(input) {
  var ret = [];
  // var email = /\"([^\"]+)\"\s+\<([^\>]+)\>/g
  // var email = ^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$
  
  //console.log("am in GetEmailsFromString function");
  var match;

//  algorithm -- while input still has a email, put the email into ret, remove it from input, and look for another.

  while (match = input.match(/[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/)) {
    ret.push(match); // add match to array
    input = input.replace(match,""); // remove match from input
  }
    
  return ret;
}

//var str = '"Name one" <foo@domain.com>, ..., "And so on" <andsoon@gmx.net>'
//var emails = GetEmailsFromString(str)



exports.start = start;
exports.upload = upload; 
exports.show = show;