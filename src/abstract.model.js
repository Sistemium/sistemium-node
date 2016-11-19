'use strict';

import request from 'request';
import _ from 'lodash';
import uuid from 'node-uuid';

const debug = require('debug')('stm:abstract.model');

export default model;

function model(name) {

  let collectionUrl = process.env.STAPI + name;

  return function (req) {

    return {
      find,
      findOne,
      findById,
      save,
      update,
      patch,
      getOrCreate,
      deleteById
    };

    function find(options) {
      return new Promise(function (resolve, reject) {

        let url = collectionUrl;

        if (typeof options === 'string') {
          url += '/' + options;
          // TODO: maybe here should be something smarter
          options = _.get(req, 'query');
        }

        //debug ('find', options);

        request({
          url: url,
          qs: options && options.params || options || _.get(req, 'query'),
          json: true,
          headers: {
            authorization: _.get(req, 'headers.authorization')
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
            authorization: _.get(req, 'headers.authorization')
          },
          json: body,
          qs: _.get(req, 'query')
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

        if (params) {
          findOne(params).then(body => {

            if (body) {
              resolve(body);
            } else {
              save(_.defaults(data, params, {id: uuid.v4()})).then(resolve, reject);
            }

          }, reject);
        } else {
          save(_.defaults(data, params, {id: uuid.v4()}))
            .then(resolve, reject);
        }

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
            authorization: _.get(req, 'headers.authorization')
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
            authorization: _.get(req, 'headers.authorization')
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

        request.patch({
          url: url,
          json: body,
          headers: {
            authorization: _.get(req, 'headers.authorization')
          }
        }, (err, res, body) => {
          if (err) {
            return reject (err);
          }

          resolve(body);
        });
      });

    }

  };


}
