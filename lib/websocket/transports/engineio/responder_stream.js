var Stream = require('stream').Stream;

function ResponderStream(socket, write) {
  var stream = new Stream();
  stream.writable = true;

  // forwarding write
  stream.write = write;

  stream.transport = socket.transport;

  return stream;
}

module.exports = ResponderStream;
