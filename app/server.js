import express from 'express';
import * as Lol from './lol';
import * as Util from './util';
import https from 'https';
import fs from 'fs';
import socket from 'socket.io';
import websocket from 'ws';
import { Router } from 'express';
import path from 'path';

const router = Router();

// Initialize the server. This will do three things:
//   1. Serve the WebXR application on Local WiFi so it can be loaded by Quest.
//   2. Thread head movement and position from WebXR through to the LoL Client.
//   3. Stream the LoL Client back to the Quest.
const app = express();
const httpsServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);
app.use('/', router);
app.use(express.static(__dirname + '/../'));
const port = 3392;
httpsServer.listen(port);

console.log(`Listening on port ${port}.`);

// Set up pages
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../index.html'));
});
router.get('/status', (req, res) => {
  res.send('Yup, the local VR client adapter is running.');
});
router.get('/watch', (req, res) => {
  res.sendFile(path.join(__dirname, '/../stream.html'));
});

// Start the streaming code
const websocketPort = 3394;
const websocketServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
});
const streamSocket = new websocket.Server({ server: websocketServer });
streamSocket.perMessageDeflate = false;
websocketServer.listen(websocketPort);

router.all('/stream', (req, res) => {
  res.connection.setTimeout(0);
  console.log('Successfully streaming from Desktop.');
  req.on("data", (data) => {
		streamSocket.broadcast(data);
	});
	
  req.on("end", () => {
		console.log("local stream has ended");
		if (req.socket.recording) {
		  req.socket.recording.close();
		}
	});
});

streamSocket.connectionCount = 0;

streamSocket.on
(
	"connection",
	function(socket, upgradeReq)
	{
		streamSocket.connectionCount++;
		console.log
		(
			'New websocket Connection: ',
			(upgradeReq || socket.upgradeReq).socket.remoteAddress,
			(upgradeReq || socket.upgradeReq).headers['user-agent'],
			'('+streamSocket.connectionCount+" total)"
		);

		socket.on
		(
			'close',
			function(code, message)
			{
				streamSocket.connectionCount--;
				console.log('Disconnected websocket ('+streamSocket.connectionCount+' total)');
			}
		);
	}
);

streamSocket.broadcast = function(data) {
	streamSocket.clients.forEach(
		function each(client) {
			if (client.readyState === websocket.OPEN) {
				client.send(data);
			}
		}
	);
};

// Start the socket code for positioning updates
const mainRoom = 'main';
const io = socket.listen(httpsServer);
global.io = io;

// When someone connects, make them the only listener
io.sockets.on('connection', socket => {
  console.log("Connection made!");
  // Empty the room
  let roomObj = io.nsps['/'].adapter.rooms[mainRoom];
  if (roomObj) {
    Object.keys(roomObj.sockets).forEach(function(id) {
      io.sockets.connected[id].leave(mainRoom);
    });
  }
  // Add the new socket
  socket.join(mainRoom);

  socket.on('pose-update', (pose) => {
    let orientation = Util.toEuler(pose.orientation);
    // Pass this through to the LoL client
    Lol.setCamera(
      {
        cameraPosition: {
          x: (0.5 + pose.position.x) * 14300,
          y: (1000 + 4000 * pose.position.y),
          z:  (0.5 - pose.position.z) * 14300
        },
        cameraRotation: {
            x: orientation[0],
            y: orientation[1],
            z: orientation[2]
        }
      },
    );
  });
});