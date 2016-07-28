'use strict';

import {Container} from 'js-data';
import {HttpAdapter} from 'js-data-http-node';

//pass config for HttpAdapter configuration and store configuration
export default function store(config) {

  const adapter = new HttpAdapter({

    basePath: config.STAPI + config.POOL_NAME,

    error: function (err) {
      console.error('jsdata.store.service.js:js-data:error:', err);
    }

  });

  const store = new Container();
  store.registerAdapter('http', adapter, {default: true});

  return store;
};
