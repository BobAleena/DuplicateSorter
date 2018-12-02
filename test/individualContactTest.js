var assert = require('assert'),
    utils = require ('../lib/utils.js');


describe('#emailTemplatePostiveTest', function () {
  it('should return documents of all templates including name to test', function (done) {
  	utils.retrieveAllDocs ("emailTemplates", function (err, docs) {
      //should only be one update currently
      docs.forEach (function (doc) { 
      	if (doc.templateName == '2015Update') {
          assert.equal('2015Update',doc.templateName);
        } else if (doc.templateName == '2016Update') {
          assert.equal('2016Update',doc.templateName);
        } else if (doc.templateName == '2016UpdateV2') {
          assert.equal('2016UpdateV2',doc.templateName);
        } else if (doc.templateName == '2017Update') {
          assert.equal('2017Update',doc.templateName);
        } else if (doc.templateName == '2018BabyUpdate') {
          assert.equal('2018BabyUpdate',doc.templateName);
        } else { assert(false); }  // should not get here unless new template that has not been added yet
      });
      done();	
  	});
  });
});

  describe('#GetSingleContactInfo', function () {
    it ("should be successful and get the info for a single contact", function(done) {
      utils.getAllTemplatesForEmail("blahblah@gmail.com", function(err, contact) {
        if (contact) {
          assert (true, true);
        }
        assert(typeof 'contact' == 'string');
        assert.deepEqual (contact, {'testtemplate': 1, '2015Update': 1, '2016UpdateV2': 1, '2017Update':1,'2018BabyUpdate':1});
        done();
      })
      
    });

  });

  describe('#AddResponseReceivedFlag', function () {
    it ("should be successful and set the response received flag for a specific Template", function(done) {
      utils.addResponseReceivedFlag('blahblah@gmail.com', '2017Update', function (err, flag) {
        if (err != null) {
          assert(false,true)
          done()
        }
        assert(flag, true);
        // note -- this can only be run once and then it will fail. need to delete this entry from the db to run it again
        done();
      });
    });

  });

  describe('#AddResponseReceivedFlagNoEmail', function () {
    it ("should fail and set the response received flag for non valid email", function(done) {
      utils.addResponseReceivedFlag('blahblah@gmail2.com','2017Update', function (err,response) {
        console.log("response is" + response);
        if (err != null) {
          assert(false, true);
        } else {
          assert(response == false);
        }
        done();
      })

    });

  });
  describe('#AddResponseReceivedFlagNotSentTemplate', function () {
    it ("should fail to set the response received flag for a Template that was not sent", function(done) {
      utils.addResponseReceivedFlag('adam.beamish@thomweb.co.uk','2016Update', function (err,response) {
        console.log("response is" + response);
        if (err != null) {
          assert(false, true);
        } else {
          assert(response == false);
        }
        done();
      })
    });
  });

  describe('#AddResponseReceivedFlagNoExistingTemplate', function () {
    it ("should fail to set the response received flag for a Template that does not exist", function(done) {
      utils.addResponseReceivedFlag('blahblah@gmail.com','dummyTemplate', function (err,response) {
        console.log("response is" + response);
        if (err != null) {
          assert(false, true);
        } else {
          assert(response == false);
        }
        done();
      })
    });
  });

  describe('#ReadResponseReceivedFlag', function () {
    it ("should be successful and read the response received flag for a template", function(done) {
        utils.checkResponseFlag('blahblah@gmail.com','2017Update', function (err, response) {
          if (err != null) {
            assert(false);
            done()
          }

        //provide email address ('blahblah@blah.com')
        // expect to receive JSON with details back
        // want to receive email address and all templates associated.
        assert(response);
        done();
      });
    });

  });

  describe('#ReadResponseReceivedFlagFail', function () {
    it ("should be successful to confirm response received flag for a template does not exist", function(done) {
      utils.checkResponseFlag('blahblah@gmail.com','2016Update', function (err, response) {
          if (err != null) {
            assert(false);
            done()
          }
        //provide email address ('blahblah@blah.com')
        // expect to receive JSON with details back
        // want to receive email address and all templates associated.
        assert(response == false);
        done();
      });
    });

  });
