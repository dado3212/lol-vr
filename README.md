# <img src="/favicons/android-chrome-192x192.png?raw=true" width="30" alt="Logo"/> League of Legends: VR Replay Viewer

This is a way of trying to hook into the LoL replay API in a VR headset. Built
this before I found out about https://github.com/nickolaj-jepsen/LoLVRSpectate
which directly hooks into the memory of the game, which was the direction I was
heading with this anyways. That being said, here's a brief summary of how to run
this if you're curious.

## How It Works

First you'll need to enable the Replay API, which will open a port up on :2999
for controlling the camera positioning. The instructions for this are described
in the Riot [Replay API documentation](https://developer.riotgames.com/docs/lol#game-client-api_replay-api)
which boils down to "add `EnableReplayApi=1` to your game.cfg file".

Then you'll need to download this repo locally. Ideally this repo would be a 
little more platform independent, but for now I'm on Windows 10, using
Node v9.11.2 (installed using `nvm install 9`), and ffmpeg v8.2.1.

Start the server with `npm run dev`. Currently all of this is hardcoded to 
https://192.168.1.5, you will need to change these values to your computer's IP
address (for connecting to with the Oculus Browser). To confirm that this is
running you can navigate to https://192.168.1.5:3392, which should show a white
screen for now.

Now you'll need to open LoL, and navigate into a replay. Then switch your client
to windowed mode, 1024x768. Move the window into the top left of your monitor,
and make sure nothing's occluding it.

Then you need to enable the streaming of the game. This is currently done in the
incredibly hacky way of screen recording with ffmpeg into a MPEG stream, which
is then rendered onto a canvas in the VR environment, which is locked to the
screen. I use the command `ffmpeg -f gdigrab -framerate 60 -video_size 1024x768 -show_region 1 -i desktop -f mpegts -codec:v mpeg1video -s 1024x768 -q 1 -bf 0 https://localhost:3392/stream` though you can tweak this depending on 
bandwidth concerns (controllable with changing the hardcoded quality (-q) flag 
anywhere from 1 = perfect to 31 = trash, or controlling bitrate with -b:v 600k).

Finally, open the Oculus browser and navigate to https://192.168.1.5:3392/.
Accept all the security stuff and you should be good to go.

## Thanks

Huge thanks to the Riot team for the API, and for [League Director](https://github.com/RiotGames/leaguedirector) the
GitHub repo that I took inspriation from. Thanks to Immersive Web, who wrote
most of the core rendering code that I'm using here (available [here](https://github.com/immersive-web/webxr-samples) and [here](https://immersive-web.github.io/webxr-samples/)). Thanks to [JSMpeg](https://github.com/phoboslab/jsmpegsdf
)), which I'm using to render the WebSocket MPEG output onto a canvas. Thanks
to [these](https://stackoverflow.com/questions/6766333/capture-windows-screen-with-ffmpeg
) [two](https://stackoverflow.com/questions/56504378/low-latency-50ms-video-streaming-with-node-js-and-html5
) SO answers for some useful code, and to [this blob](https://github.com/Willjfield/QuaterniontoEuler/blob/master/quatEuler.js
) for the quaternion <> Euler angle conversion code.

## May Be Useful

For regenerating the keys that I use to make this 'https'. https is needed,
because WebXR only works on https and localhost.

```
openssl genrsa -out key.pem
-- US, California, LoLVR Client
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

For debugging purposes, if the Quest 2 is connected via a cord, you can check
the console by navigating to chrome://inspect/#devices.

requestAnimationFrame is broken for canvas events. I swapped the instances in 
jsmpeg.min.js to instead use setInterval. See immersive-web/webxr#225 for more
details, but if the JSMpeg version is updated, this should be repatched.

## Known Issues
* Movement is buggy. Using the position has drift, which isn't accounted for. The different scaling also makes moving around very unintuitive
* Laggy. Turns out screen recording, passing over a websocket, deserializing and writing to a canvas while also rendering a 3D VR environment is not super fast.
* Not really 3D. This is rendering a static image to both eyes, which doesn't give it a sense of true depth.
* Quality. FFMPEG is slightly limited in what it can do.
* Resolution. For some reason it's rendering it as a square when the stream is clearly 1024x768. This should be fixed.
