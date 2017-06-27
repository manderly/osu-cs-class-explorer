/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  upsert
 * PATCH   /api/things/:id          ->  patch
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Thing} from '../../sqldb';

var gsjson = require('google-spreadsheet-to-json');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

var creds_json = {
  client_email: 'osu-class-explorer@api-project-700272715173.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD6+utHi5OD99dB\nInomCT/EmxBU4WEAcqoDB9mO1YzikejZF7P4Y63FnavXHfNWlCBkmCLM/yGXoWD+\nEwRB2n2bPztF6I193xIAGn80BVAYB+1PEDjkQkYP8WP+Vob5j/yAOhOJI47WTn/J\nhtUXI6TcDrGfUKWN73rL8ZYp6ZAWnykMSeNQ/6GI+pqaJ6zA35syLMzF1PtwMEu6\neGZDvU/OHrUQ++6sAQ8H4uDOoFa5Ex9B+iO6A4iXvm0EjZDQ3NXgoDAzYH1k91kk\nI6yYT7YPwWwl6pf14GYgat4LegXRb/wkqeyssP9nKb3MVLCJvpO9jqeZ6lAC/6vX\nUluiDtJxAgMBAAECggEADkQ1O7RUmMC9w9RDMd5umVUYZ//F9xvde8W+ZVjwnMgv\nHoiDNJpLbF9Yn1YysOwjfX5bo5AY22z7JcQkVr82Cr0s2A3mnZYgmICJFKac6XnJ\nYLg3CKwW/hTiUoi9/EmF0I7kkYQDvH06tLSZMCsYteDQslH38C4Ryo4fc19VP0DU\n58Z9JKHRwEo75F+oKA+kdk8VHfsDH5BtzDfXCuRR48N+Xc1TJDqZtbe2YCK2Ur5y\n+zxz7xE5UDHMlnKQgGj+T/22XcKNRe0WnHPCyET204RaZEIZT4CHY5ZJVdZ+vAHy\naovS9OximV1HpogP11PBkGrsuG+QVcfBXDJpS4E2gQKBgQD/VbwdyQDPIVxI/7S6\nwmbnWU9dGJScm6uIK872EDGHvMQFzpHPQkTN5sb8S1UaoBWB7kj1fJ/XW/usG0lC\nNg5DqIIuUXKY0TPW89jMu3cvDYNfPzv/wy4hBL61i6c4Ed5o9pm5/trOpirZCNfL\n7a1ZgGuK9WlYh7JfH/ioAnWrgQKBgQD7okfFCIYsEBASF0YZh/qyKIQSefuAo5QV\nuOfyNeIiKU1g51cNgPRSC/Yyt46rDUbe619b4GA8CM1Y0tHQ5L2KEG4kwmWq/fy0\nvdqdRZY4RD9jWtxftm3Q6dJqDq46MOzrseJhG4gh9BwIpMXk8HtjhLjCd4zxolHQ\nBkKH789e8QKBgQDFXp1qHKy+b5gpaVdnocvveu7JFK4TnJVsTgjN1dijhvuzTWkS\nX7RVwNUBwq2HRkU5yVqmP+5Ch3y0Hed0Adrm28O9UAIYNGYw+w8Turk3Kufo4TVc\nz5/BsCxGoyvgQJe+ZRiRWHoEkRe/6oD8xr1f2M/Ie0kyQLpVo54PKM+SgQKBgGog\nLxSyW6QJwj1fA3mRF/I7lDgWqjO+yZ2/tlM41n6B3NiZuOVBFcnksZkCQXFy0AkE\nS9t77hpju/dSMptfXXD1LP7j3e0X4ZR43dKmnoxsfC9zCq5zSi1p8Aw61NBGAiYF\nh+xcqDVptskOdUfxBJkcSK/7q73dL5QEj9q1EUiBAoGAbNdJkhFI38ubgTka7Pwx\naGq7i2SBFXoqXuyCawoyGr95fI68SYSKUO8D3fCmi5KqzhyeOG+Y0uDtXITYS02u\n9bjreiKHBqELfCOGGHpJch54QhcZYmNAt4f96DmwCiVo8r74ktE6obhBlPi6AGfW\nhRYpRSVAVIgK/3tXAIub6hw=\n-----END PRIVATE KEY-----\n'
};


// Gets a list of Things
export function index(req, res) {
  return gsjson({
    spreadsheetId: '1pdnIGycCQ5UZGIDNQBQd5hj2qVooxkbhZxbIx7Sn1nc',
    credentials: creds_json
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Thing.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Thing in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }

  return Thing.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
