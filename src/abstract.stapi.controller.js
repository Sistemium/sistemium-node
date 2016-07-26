'use strict';

import _ from 'lodash';

/**
 *
 * @param {Object} model
 * @returns {Object} - Controller object
 */
function controller(model) {

  function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
      if (entity) {
        res.status(statusCode).json(entity);
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

  // Gets a list of ProviderAccounts
  function index(req, res) {
    (req.model || model)(req).find()
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  function show(req, res) {

    (req.model || model)(req).findById(req.params.id)
      .then(respondWithResult(res))
      .catch(handleError(res))
    ;
  }

  function create(req, res) {
    (req.model || model)(req).create(req.body)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

  function destroy(req, res) {
    (req.model || model)(req).findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(removeEntity(res))
      .catch(handleError(res));
  }

  function update(req, res) {
    if (req.body.id) {
      delete req.body.id;
    }
    (req.model || model)(req).findById(req.params.id)
      .then(handleEntityNotFound(res))
      .then(saveUpdates(req.body))
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


