'use strict';

const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

const changedefault ={
  detect:'2K HD Camera',
  detected:false,
  changed:false
}

let action = 0;
audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

function gotDevices(deviceInfos) {
  // action = 0;
  // Handles being called several times to update labels. Preserve values.
  // changedefault.detected=deviceInfos.find(device=>device.label===changedefault.detect)
  console.log(deviceInfos.find(device=>device.label===changedefault.detect))
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    // if(changedefault.detected && !changedefault.changed && deviceInfo.label.includes(changedefault.detect)){
    if(deviceInfo.label.includes(changedefault.detect)){
      option.selected=true
      changedefault.changed=true
      // console.log(changedefault)
      action++
    }else {
      if (deviceInfo.label.includes(changedefault.detect)){
        // action++
      }
      // console.log(deviceInfo.label.includes(changedefault.detect))
      // console.log(action)
    }

    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      if (deviceInfo.label.includes(changedefault.detect)){
        changedefault.detected = deviceInfo.label.includes(changedefault.detect)
        console.log(deviceInfo.label.includes(changedefault.detect))
        // videoSelect.selectedIndex = 1
        option.text = deviceInfo.label + 'esta es la tipa' || `camera ${videoSelect.length + 1}`;
      }else{
        option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      }
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }


  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
navigator.mediaDevices.ondevicechange = function(event) {

  // console.log('Dispositivos cambiados')
  // navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
  setTimeout(function () {
    start();
  },1000)
}
// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}


function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices()
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }


  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    // video: {deviceId: videoSource}
    video: { width: 1280, height: 720 },
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;

videoSelect.onchange = start;

setTimeout(function () {
  start();
},100)

