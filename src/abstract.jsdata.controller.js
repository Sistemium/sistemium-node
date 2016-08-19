'use strict';

import _ from 'lodash';
const debug = require('debug')('AuthAPI:api:abstract:jsdata');

/**
 *
 * @param {Object} model
 * @returns {Object} - Controller object
 */
function controller(model) {

  function respondWithResult(res, statusCode) {

    //debug('res:', res);
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

  // Gets a list of ProviderAccounts
  function findAll(req, res) {
    let options;
    /**
     * Using the `query` argument, select records to retrieve via an adapter.
     *
     * {@link Mapper#beforeFindAll} will be called before calling the adapter.
     * {@link Mapper#afterFindAll} will be called after calling the adapter.
     *
     * @example <caption>Find all "published" blog posts</caption>
     * PostService.findAll({ status: 'published' }).then((posts) => {
   *   console.log(posts) // [{ id: 1, status: 'published', ...}, ...]
   * })
     *
     * @example <caption>Get full response</caption>
     * PostService.findAll({ status: 'published' }, { raw: true }).then((result) => {
   *   console.log(result.data) // [{ id: 1, status: 'published', ...}, ...]
   *   console.log(result.found) // e.g. 13
   *   console.log(...) // etc., more metadata can be found on the result
   * })
     *
     * @method Mapper#findAll
     * @param {Object} [query={}] Selection query. See {@link query}.
     * @param {Object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {Object} [opts] Configuration options. Refer to the `findAll` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @returns {Promise} Resolves with the found records, if any.
     * @see query
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
     */


    model.findAll(req && req.options || req.query || null, {
      headers: {
        authorization: req && req.headers.authorization
      }
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  function find(req, res) {

    /**
     * Retrieve via an adapter the record with the given primary key.
     *
     * {@link Mapper#beforeFind} will be called before calling the adapter.
     * {@link Mapper#afterFind} will be called after calling the adapter.
     *
     * @example
     * PostService.find(1).then((post) => {
   *   console.log(post) // { id: 1, ...}
   * })
     *
     * @example <caption>Get full response</caption>
     * PostService.find(1, { raw: true }).then((result) => {
   *   console.log(result.data) // { id: 1, ...}
   *   console.log(result.found) // 1
   *   console.log(...) // etc., more metadata can be found on the result
   * })
     *
     * @method Mapper#find
     * @param {(string|number)} id The primary key of the record to retrieve.
     * @param {Object} [opts] Configuration options. Refer to the `find` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @returns {Promise} Resolves with the found record. Resolves with
     * `undefined` if no record was found.
     * @see http://www.js-data.io/v3.0/docs/reading-data
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
     */

    if (!req || !req.params || !req.params.id) {
      throw new Error('req params id should be passed!!');
    }

    return model.find(req.params.id, {
      headers: {
        authorization: req && req.headers.authorization
      }
    })
      .then(respondWithResult(res))
      .catch(handleError(res))
      ;
  }

  function create(req, res) {
    /**
     * Create and save a new the record using the provided `props`.
     *
     * {@link Mapper#beforeCreate} will be called before calling the adapter.
     * {@link Mapper#afterCreate} will be called after calling the adapter.
     *
     * @example <caption>Create and save a new blog post</caption>
     * PostService.create({
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'draft', ... }
   * })
     *
     * @method Mapper#create
     * @param {Object} props The properties for the new record.
     * @param {Object} [opts] Configuration options. Refer to the `create` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading
     * create if `props` contains nested relations. NOT performed in a
     * transaction. Each nested create will result in another {@link Mapper#create}
     * or {@link Mapper#createMany} call.
     * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
     * of the payload. Normally relations are not sent.
     * @returns {Promise} Resolves with the created record.
     * @since 3.0.0
     */

    if (!req || !req.body) {
      throw new Error('req body should be passed!!');
    }

    model.create(req.body, {
      headers: {
        authorization: req && req.headers.authorization
      }
    })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

  function destroy(req, res) {
    /**
     * Using an adapter, destroy the record with the given primary key.
     *
     * {@link Mapper#beforeDestroy} will be called before destroying the record.
     * {@link Mapper#afterDestroy} will be called after destroying the record.
     *
     * @example <caption>Destroy a specific blog post</caption>
     * PostService.destroy(1234).then(() => {
   *   // Blog post #1234 has been destroyed
   * })
     *
     * @example <caption>Get full response</caption>
     * PostService.destroy(1234, { raw: true }).then((result) => {
   *   console.log(result.deleted) e.g. 1
   *   console.log(...) // etc., more metadata can be found on the result
   * })
     *
     * @method Mapper#destroy
     * @param {(string|number)} id The primary key of the record to destroy.
     * @param {Object} [opts] Configuration options. Refer to the `destroy` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves when the record has been destroyed. Resolves
     * even if no record was found to be destroyed.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    find(req, res)
      .then(handleEntityNotFound(res))
      .then(removeEntity(res))
      .catch(handleError(res));
  }

  function update(req, res) {

    /**
     * Using an adapter, update the record with the primary key specified by the
     * `id` argument.
     *
     * {@link Mapper#beforeUpdate} will be called before updating the record.
     * {@link Mapper#afterUpdate} will be called after updating the record.
     *
     * @example <caption>Update a specific post</caption>
     * PostService.update(1234, {
   *   status: 'published',
   *   published_at: new Date()
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'published', ... }
   * })
     *
     * @method Mapper#update
     * @param {(string|number)} id The primary key of the record to update.
     * @param {Object} props The update to apply to the record.
     * @param {Object} [opts] Configuration options. Refer to the `update` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * transaction.
     * @returns {Promise} Resolves with the updated record. Rejects if the record
     * could not be found.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    if (req.body.id) {
      delete req.body.id;
    }

    find(req, res)
      .then(handleEntityNotFound(res))
      .then(saveUpdates(req.body))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  return {
    find: find,
    findAll: findAll,
    create: create,
    destroy: destroy,
    update: update
  };
}

export default controller;


