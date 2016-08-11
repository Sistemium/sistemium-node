'use strict';
import request from 'request';
var _ = require('lodash');
var debug = require('debug')('authAPI:abstract.model');
var uuid = require('node-uuid');

function model(name) {

  var collectionUrl = process.env.STAPI + name;

  return function (req) {

    function find(options) {
      return new Promise(function (resolve, reject) {

        let url = collectionUrl;

        if (typeof options === 'string') {
          url += '/' + options;
          // TODO: maybe here should be something smarter
          options = req.query;
        }

        //debug ('find', options);

        request({
          url: url,
          qs: options && options.params || options,
          json: true,
          headers: {
            authorization: req && req.headers.authorization
          }
        }, function (err, res, body) {

          //debug ('find',body);
          if (err) {
            return reject(err);
          }

          if (!body) {
            return resolve([]);
          }

          try {
            resolve(body.length ? body : [body]);
          } catch (err) {
            reject(err);
          }

        });

      });
    }

    function findOne(options) {
      return new Promise((resolve, reject) => {

        debug('findOne options:', options);
        find(options).then(reply => {
          debug('reply:', reply);

          if (reply) {
            if (_.isArray(reply)) {

              if (reply.length > 1) {
                console.error('abstract.model.findOne reply length=', reply.length);
                return reject('reply length > 1');
              }

              resolve(reply[0]);

            } else {
              console.error('abstract.model.findOne incorrect reply');
              reject(reply);
            }

          } else {
            resolve(false);
          }
        }, reject);

      });
    }

    function save(body) {
      return new Promise(function (resolve, reject) {

        request.post({
          url: collectionUrl,
          headers: {
            authorization: req && req.headers.authorization
          },
          json: body,
          qs: req.query
        }, function (err, res, json) {

          debug('save response:', res.statusCode, json);

          let e = err;

          if (!err && [201,200].indexOf(res.statusCode) === -1) {
            e = {
              status: res.statusCode,
              data: json
            };
          }

          if (e) {
            debug('save error:', e);
            reject(e);
          } else {
            resolve(json);
          }

        });

      });
    }

    function getOrCreate(params, data) {

      return new Promise((resolve, reject) => {
        findOne(params).then(body => {

          if (body) {
            resolve(body, 'get');
          } else {
            save(_.defaults(data, params, {id: uuid.v4()})).then(resolve, reject);
          }

        }, reject);
      });

    }

    function findById(id) {
      return findOne(id);
    }

    function deleteById(id) {
      return new Promise(function (resolve, reject) {

        let url = collectionUrl + '/' + id;

        request.del({
          url: url,
          headers: {
            authorization: req && req.headers.authorization
          }
        }, function (err, res, body) {
          if (err) {
            return reject(err);
          }

          resolve(body);
        });

      });
    }

    function update(id, body) {
      return new Promise(function (resolve, reject) {

        let url = collectionUrl + '/' + id;

        request.put({
          url: url,
          json: body,
          headers: {
            authorization: req && req.headers.authorization
          }
        }, function (err, res, body) {
          if (err) {
            return reject (err);
          }

          resolve(body);
        });

      });
    }

    function patch (id, body) {

      return new Promise (function (resolve, reject) {
        let url = collectionUrl + '/' + id;

        //debug ('patch authorization:',req.headers);

        request.patch({
          url: url,
          json: body,
          headers: {
            authorization: req && req.headers.authorization
          }
        }, (err, res, body) => {
          if (err) {
            return reject (err);
          }

          resolve(body);
        });
      });

    }

    return {
      find: find,
      findOne: findOne,
      findById: findById,
      save: save,
      update: update,
      patch: patch,
      getOrCreate: getOrCreate,
      deleteById: deleteById
    };
  };


}

export default model;
