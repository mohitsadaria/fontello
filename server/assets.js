'use strict';


/*global N*/


// 3rd-party
var Mincer  = require('mincer');


// internal
var logger = N.logger.getLogger('server.assets');


////////////////////////////////////////////////////////////////////////////////


var server;


// Formats and writes log event into our logger
//
function assets_logger(level, event) {
  logger[level]('%s - "%s %s HTTP/%s" %d "%s" - %s',
                event.remoteAddress,
                event.method,
                event.url,
                event.httpVersion,
                event.code,
                event.headers['user-agent'],
                event.message);
}


// helper to pass request to the lazy-loaded miner server
function call_mincer_server(req, res) {
  var assets;

  if (!server) {
    assets = N.runtime.assets,
    server = new Mincer.Server(assets.environment, assets.manifest);
    server.log = assets_logger;
  }

  server.handle(req, res);
}


////////////////////////////////////////////////////////////////////////////////


// Validate input parameters
N.validate({
  path: {
    type: "string",
    required: true
  }
});


module.exports = function (params, callback) {
  if (!this.origin.http) {
    callback({code: N.io.BAD_REQUEST, body: "HTTP ONLY"});
    return;
  }

  this.origin.http.req.url = params.path;
  call_mincer_server(this.origin.http.req, this.origin.http.res);
};
