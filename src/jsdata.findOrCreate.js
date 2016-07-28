"use strict";
var debug = require('debug')('authAPI:models:js-data:findOrCreate');

function findOrCreate(id, body) {

  return new Promise((fulfil, reject) => {

    var name = this.name;

    if (!id && body) {

      this.create(body)
        .then((res) => {
          debug('created:', name, res);
          fulfil(res);
        }, reject);

    } else {

      this.find(id)
        .then(res => {
          debug('found by id:', name, res);
          fulfil(res);
        })
        .catch((err) => {
          debug('not found by id:', name, err);
          if (!body) {
            return reject({
              data: 'not found and empty body'
            });
          }
          this.create(body)
            .then(res => {
              debug('created:', name, res);
              fulfil(res);
            }, reject);
        });

    }

  });
}

export {findOrCreate};
