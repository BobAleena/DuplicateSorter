var assert = require('assert'),
    utils = require ('../lib/utils.js');

describe('#emailTemplatePostiveTest', function () {
  it('should return documents of all templates including name to test', function (done) {
  	utils.retrieveAllDocs ("emailTemplates", function (err, docs) {
      //should only be one update currently
      docs.forEach (function (doc) { 
      	//assert(typeof 'doc.templateName' == 'string');
        assert.equal('2015Update',doc.templateName);
      });
      done();	
  	});
  });
});

describe('#emailTemplateNegativeTest', function () {
  it('should return documents of all templates but name to test should not exist', function (done) {
  	utils.retrieveAllDocs ("emailTemplates", function (err, docs) {
      //should only be one update currently
      docs.forEach (function (doc) { 
      	assert(typeof 'doc.templateName' == 'string');
        assert.notEqual('2020Update',doc.templateName);
      });
      done();	
  	});
  });
});

describe('#addNewDocPositiveTest', function () {
  it('should be successful as email and template should not already exist', function (done) {
    utils.addNewDoc("thisEmail@AddedForTests.com", "2015Update", function (err, result){
      if (result == undefined) {
        assert(false);
      } else {
        assert (true);
      }
      done();
    });
  });
});

describe('#emailAddressExistsTest()', function() {

  it('should return true when the value is present', function(done) {
  	utils.emailAddressExists("thisEmail@AddedForTests.com", function (err, returnVal, templates) {
  	  assert.equal(true, returnVal);
  	  done();
  	});
  });

});


describe('#emailAddressDoesNotExistTest()', function() {

  it('should return false when the value is not present', function(done) {
  	utils.emailAddressExists("thisEmail@doesNotExist", function (err, returnVal, templates) {
  		if (err) {console.err(err); }
  	  assert.equal(false, returnVal);
  	  done();
  	});
  });
});



describe('#emailAddressExistsCapitalsTest()', function() {

  it('should return true when the value is present with different case', function(done) {
  	utils.emailAddressExists("THISEmail@AddedFORTests.com", function (err, returnVal, templates) {
  	  assert.equal(true, returnVal);
  	  done();
  	});
  });

});


describe('#emailAddressAndTemplateExistTest()', function() {

  it('should return true when name and template are present', function(done) {
  	utils.emailAddressAndTemplateExists("thisEmail@AddedForTests.com", "2015Update", function (err, returnVal, returnVal2) {
  	  assert.equal(true, returnVal);
  	  assert.equal(true, returnVal2);
  	  done();
  	});
  });

});


describe('#emailAddressAndTemplateDoesNotExistTest()', function() {

  it('should return true when the name is present, but template is not present', function(done) {
  	utils.emailAddressAndTemplateExists("thisEmail@AddedForTests.com", "2020Update", function (err, returnVal, returnVal2) {
  	  assert.equal(true, returnVal);
  	  assert.equal(false, returnVal2);
  	  done();
  	});
  });

});

describe('#fieldExistsTest()', function() {

  it('should return true when the value is  present', function(done) {
  	utils.fieldExists({"emailAddress": "thisemail@addedfortests.com"}, function (err, returnVal) {
  		if (err) {console.err(err); }
      console.log(returnVal);
  	  assert.equal(true, returnVal);
  	  done();
  	});
  });

});


describe('#fieldDoesNotExistTest()', function() {

  it('should return false when the value is not present', function(done) {
  	utils.fieldExists({"emailAddress": "thisEmail@NotAddedForTests.com"}, function (err, returnVal) {
  		if (err) {console.err(err); }
  	  assert.equal(false, returnVal);
  	  done();
  	});
  });

});

describe('#fieldsExistTest()', function() {

  it('should return 1 when the value is not present', function(done) {
  	utils.fieldExists({"emailAddress": "thisemail@addedfortests.com", "EmailsSent": { "2015Update": 1} }, function (err, returnVal) {
  		if (err) {console.err(err); }
  	  assert.equal(true, returnVal);
  	  done();
  	});
  });

});

describe('#addTemplateToExisting()', function() {
  it('should return true on a successful add of the new template', function (done) {
    utils.addNewDoc("thisEmail@AddedForTests.com", "testtemplate", function (err, result){
      if (result == undefined) {
        assert(false);
      } else {
        assert (true);
      }
      done();
    });
  });
})


describe('#emailAddressAndNewTemplateExistTest()', function() {

  it('should return true when the name is present, but template is not present', function(done) {
    utils.emailAddressAndTemplateExists("thisEmail@AddedForTests.com", "testtemplate", function (err, returnVal, returnVal2) {
      assert.equal(true, returnVal);
      assert.equal(true, returnVal2);
      done();
    });
  });

});



describe('#addNewDocNegativeTest', function () {
  it('should not be successful as email and template already exist, should return false', function (done) {
  	utils.addNewDoc("thisEmail@AddedForTests.com", "2015Update", function (err, result){
  		if (result == undefined) {
        //console.log("undefined")
  		  assert(true);
  		} else if (result == false) {
        //console.log("did not add - false")
        assert (true);
      } else {
        //console.log("added");
  		  assert (false);
  		}
      done();
  	});
  });
});


describe('#removeEmailAddressExists', function () {
  it('should be successful as email address was added earlier, should return true', function (done) {
    utils.removeEmailAddress("thisEmail@AddedForTests.com", function (err, result) {
      console.log("about to assert" + result);
      assert (result);
      done();
    });
  });
});


describe('#removeEmailAddressDoesNotExist', function () {
  it('should be unsuccessful as email address was removed earlier, should return false', function (done) {
    utils.removeEmailAddress("thisEmail@AddedForTests.com", function (err, result) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("about to assert" + result);
      assert (!result);
      done();
    });
  });
});

describe('#addANewTemplate', function() {
  it("should be successful since the template should not exist yet", function (done) {
    utils.addNewTemplate("MochaTest_Template", function(err, result) {
      if (err) {
        console.error(err)
        return;
      }
      if (result == undefined) {
        assert (false);
      } else {
        assert (true)
      }
      done();
    });
  });
});

describe('#addANewTemplateNegative', function() {
  it("should be unsuccessful since the template should exist from previous", function (done) {
    utils.addNewTemplate("MochaTest_Template", function(err, result) {
      if (result == undefined) {
        assert (true);
      } else {
        assert (false)
      }
      done();
    });
  });
});

describe('#RemoveTemplate', function() {
  it("should be successful since the template should exist yet", function (done) {
    utils.removeTemplate("MochaTest_Template", function(err, result) {
      if (err) {
        console.error(err);
      }
    assert (result);
    done();
  });
});
});

describe('GetEmailsForTemplate', function() {
it("should fail with a number of emailaddresses", function(done) {
  utils.retrieveEmailsForTemplate("MochaTest_Template", function(err,result) {
    if (err) {
      console.error(err);      
    }
    assert (!result);
    done();
  });
});

});

describe('GetEmailsForTemplate', function() {
it("should be successful with a number of emailaddresses", function(done) {
  utils.retrieveEmailsForTemplate("2015Update", function(err,result) {
    if (err) {
      console.error(err);      
    }
    //result.forEach(function(address) {
    //  console.log(address)
    //});
    assert (result);
    done();
  });
});

});




