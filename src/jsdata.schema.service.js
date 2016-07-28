"use strict";

import store from './jsdata.store.service';
const debug = require('debug')('authAPI:modelSchema');
import {findOrCreate} from './jsdata.findOrCreate';

let models = {};

export default function schema (storeConfig) {
  let configuredStore = store(storeConfig);

  function registerModel(modelName, mapper) {
    models[modelName] = mapper;
    debug('registerModel:', modelName);
  }

  function defineMapper(name, config) {
    configuredStore.defineMapper(name, config);
    //extend every mapper with findOrCreate method
    let mapper = getMapper(name);
    mapper.findOrCreate = findOrCreate;

    registerModel(name, mapper);

    return mapper;
  }

  function getMapper(name) {
    return configuredStore.getMapper(name);
  }

  function model(name) {
    return models[name];
  }

  return {
    defineMapper,
    getMapper,
    model,
    //for debugging
    models
  }
}

