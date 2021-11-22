# LoL VR

```
openssl genrsa -out key.pem
-- US, California, LoLVR Client
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```
Run this with `npm run dev` and then load https://192.168.1.5:3392/ in the Oculus
browser. You'll probably need to figure out the IP, and bypass some security stuff.

Formalize this in a web browser on client as well.

Make sure lol and enable replay api is working correctly.

https is needed, because webxr only works on https and localhost

For debugging purposes, you can use this to connect to the console.log for the Oculus. chrome://inspect/#devices

Running with nvm use 9.11.2 (nvm install 9)

To run this.
1. Run `npm run dev` and confirm that it's listening on 3392 with https://localhost:3392/status.
2. Open the LoL Client (confirm it's set up correctly) and set it to be windowed at 1024x748.
3. Open the Oculus browser and navigate to https://192.168.1.5:3392/. Accept all
   the security stuff and you should be good to go.
4. Run `ffmpeg -f gdigrab -framerate 20 -video_size 1024x768 -show_region 1 -i desktop -f mpegts -codec:v mpeg1video -s 1024x768 -b:v 600k -bf 0 https://localhost:3392/stream`

ffmpeg -f gdigrab -framerate 60 -video_size 1024x768 -show_region 1 -i desktop -f mpegts -codec:v mpeg1video -s 2048x1024 -bf 0 https://localhost:3392/stream

# Thanks to
https://stackoverflow.com/questions/6766333/capture-windows-screen-with-ffmpeg
https://github.com/immersive-web/webxr-samples
https://stackoverflow.com/questions/56504378/low-latency-50ms-video-streaming-with-node-js-and-html5
https://immersive-web.github.io/webxr-samples/
https://github.com/phoboslab/jsmpegsdf

https://192.168.1.5:3392/

Unminify jsmpeg.min.js
requestAnimationFrame breaks with WebXR according to immersive-web/webxr#225. Swap
to getInterval.