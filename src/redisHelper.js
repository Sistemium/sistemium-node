import sistemiumRedis from 'sistemium-redis';


function setup (config) {
  sistemiumRedis.setup(config);
}

function hget (name, key) {
  return sistemiumRedis.hgetJson(name, key);
}

function hset (name, id, data) {
  return sistemiumRedis.hsetJson(name, id, data);
}

export default {setup, hget, hset};
