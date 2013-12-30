function route (handler, pathname, response, postData) {
  //console.log("About to route a request for " + pathname);
  if (typeof handler[pathname] === 'function') {  // this tests if pathname is a key to a function stored in the handle hash
    handler[pathname](response, postData);
    //console.log("got a function!" + postData);
  } else {
    console.log("ERROR: no function exists for " + pathname);
  }

}

exports.route = route;								