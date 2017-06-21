'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var thingCtrlStub = {
  index: 'thingCtrl.index',
  show: 'thingCtrl.show',
  create: 'thingCtrl.create',
  upsert: 'thingCtrl.upsert',
  patch: 'thingCtrl.patch',
  destroy: 'thingCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var thingIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './thing.controller': thingCtrlStub
});

describe('Thing API Router:', function() {
  it('should return an express router instance', function() {
    expect(thingIndex).to.equal(routerStub);
  });

  describe('GET /api/things', function() {
    it('should route to thing.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'thingCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/things/:id', function() {
    it('should route to thing.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'thingCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/things', function() {
    it('should route to thing.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'thingCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/things/:id', function() {
    it('should route to thing.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'thingCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/things/:id', function() {
    it('should route to thing.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'thingCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/things/:id', function() {
    it('should route to thing.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'thingCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
