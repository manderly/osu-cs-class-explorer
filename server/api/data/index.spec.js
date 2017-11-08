'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var dataCtrlStub = {
  index: 'dataCtrl.index',
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var dataIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './data.controller': dataCtrlStub
});

describe('Data API Router:', function() {
  it('should return an express router instance', function() {
    expect(dataIndex).to.equal(routerStub);
  });

  describe('GET /api/data', function() {
    it('should route to data.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'dataCtrl.index')
        ).to.have.been.calledOnce;
    });
  });
});
