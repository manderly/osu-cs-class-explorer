'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newData;

describe('Data API:', function() {
  describe('GET /api/data', function() {
    var data;

    beforeEach(function(done) {
      request(app)
        .get('/api/data')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          data = res.body;
          done();
        });
    });

    it('should respond with JSON data', function() {
      expect(data).to.be.instanceOf(Object);
    });
  });
});
