'use strict';

var debug = require('debug')('stm:node:stapi:controller');
import _ from 'lodash';

/**
 *
 * @param {Object} defaultModel
 * @returns {Object} - Controller object
 */
function controller(defaultModel) {

  function model(req) {
    return (req.model || defaultModel)(req);
  }

  function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
      if (entity) {
        res.status(statusCode).json(entity);
        return entity;
      } else {
        res.status(404).end();
      }
    };
  }

  function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
      res.status(statusCode).send(err);
    };
  }

  function saveUpdates(updates) {
    return function (entity) {
      var updated = _.merge(entity, updates);
      return updated.save()
        .spread(updated => {
          return updated;
        });
    };
  }

  function handleEntityNotFound(res) {
    return function (entity) {
      if (!entity) {
        res.status(404).end();
        return null;
      }
      return entity;
    };
  }

  function removeEntity(res) {
    return function (entity) {
      if (entity) {
        return entity.remove()
          .then(() => {
            res.status(204).end();
          });
      }
    };
  }

  function index(req, res) {
    var options = req.query;
    if (req.params.id) {
      options.id = req.params.id;
    }
    return model(req).find(options)
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  function show(req, res) {
    return model(req).findById(req.params.id)
      .then(respondWithResult(res))
      .catch(handleError(res))
      ;
  }

  function create(req, res, onSuccess) {
    var q = model(req).save(req.body);

    (onSuccess ? new Promise((resolve, reject) => {
      q.then(res => {
        onSuccess(res)
          .then(resolve, reject);
      }, reject);
    }) : q)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

  function destroy(req, res) {
    return model(req).findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(removeEntity(res))
      .catch(handleError(res));
  }

  function update(req, res) {
    if (req.params.id && req.body.id) {
      delete req.body.id;
    }
    return model(req).update(req.params.id, req.body)
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  return {
    index: index,
    show: show,
    create: create,
    destroy: destroy,
    update: update
  };
}

export default controller;


