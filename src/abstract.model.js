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
          options = undefined;
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
      //debug ('findOne',options);
      return new Promise((resolve, reject) => {

        debug('options:', options);
        find(options).then(reply => {
          debug('reply:', reply);
          reply && reply.length && resolve(reply[0]) || resolve(false);
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
          json: body
        }, function (err, res, json) {
          debug(res.statusCode, json);
          let e = err || res.statusCode !== 200 && json;
          if (e) {
            e = res.statusCode !== 201 && json;
          }
          debug('save', e);
          e && reject(e) || resolve(body);
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
