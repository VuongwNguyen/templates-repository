const { Server } = require("socket.io");

let io;
const socketinitialize = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // io.use(function (socket, next) {
  //   const token = socket.handshake.auth.token;
  //   if (isValid(token)) return next();
  // });

  io.on("connection", (socket) => {
    
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { socketinitialize, getIO };
