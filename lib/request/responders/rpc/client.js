// Tell's the browser how to respond to incoming 'rpc' messages
'use strict';

var cbStack, defaultCallback, numRequests, ss;

ss = require('socketstream');

numRequests = 0;

cbStack = {};

// Default callback
defaultCallback = function(x) {
  return console.log(x);
};

// SENDING

module.exports = function(responderId, config, send) {
  ss.registerApi('rpc', function() {
    var args, cb, lastArg, msg, obj;
    args = [].slice.call(arguments);

    // Prepare message
    obj = {};
    obj.m = args[0];        // method
    obj.id = ++numRequests; // unique request id

    // Callback
    lastArg = args[args.length - 1];
    if (typeof lastArg === 'function') {
      obj.p = args.slice(1, args.length - 1);
      cb = lastArg;
    } else {
      obj.p = args.slice(1);
      cb = defaultCallback;
    }

    // Always return promise
    return new Promise(function (resolve, reject) {

      // Add callback to stack
      cbStack[obj.id] = function (err) {
        cb.apply(this, arguments);
        if (err) {
          reject(err);
        } else {
          resolve([].slice.call(arguments, 1));
        }
      };

      // Convert to JSON
      msg = JSON.stringify(obj);

      // Send it!
      send(msg);
    });
  });

  // RECEIVING

  return ss.message.on(responderId, function(msg) {
    var cb, obj;
    obj = JSON.parse(msg);

    // If callback
    if (obj.id && (cb = cbStack[obj.id])) {
      if (obj.e) {
        console.error('SocketStream RPC server error:', obj.e.message);
      } else if (obj.p) {
        cb.apply(cb, obj.p);
      }
      if (!obj.s){
        delete cbStack[obj.id];
      }
    }
  });
};
