var Stream = require('stream').Stream;

function RpcStream(socket, write, end, handleError) {
  var stream = new Stream();
  stream.writable = true;

  socket.on("error", handleError);

  // forwarding write
  stream.write = write;
  stream.end = stream.destroy = end;

  stream.transport = socket.transport;

  return stream;
}

module.exports = RpcStream;
