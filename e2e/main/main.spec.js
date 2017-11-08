'use strict';

var config = browser.params;

describe('Main View', function() {
  var page;

  beforeEach(function() {
    let promise = browser.get(config.baseUrl + '/');
    page = require('./main.po');
    return promise;
  });

  it('should include text OSU CS Course Explorer in the header', function() {
    expect(page.h1El.getText()).to.eventually.equal('OSU CS Course Explorer');
  });
});
