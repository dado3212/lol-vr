import axios from 'axios';
import https from 'https';

export const setCamera = (cameraPositionRotation) => {
axios.post('https://127.0.0.1:2999/replay/render', cameraPositionRotation,
{
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  })
.then((res) => {
    // console.log(`Status: ${res.status}`);
    // console.log('Body: ', res.data);
    // let newPosition = cameraPositionRotation;
    // newPosition.cameraRotation.x = ((newPosition.cameraRotation.x + 1) % 360);
    // newPosition.cameraRotation.y = 10;
    // setCamera(newPosition);
}).catch((err) => {
  if (err.errno == 'ECONNREFUSED') {
    // ignore this for now
    console.log('Failed to connect to port :2999');
  } else {
    console.error(err);
    throw 'Parameter is not a number!';
  }
});
};
