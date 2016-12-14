var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// https://github.com/urtzurd/html-audio/blob/gh-pages/static/js/pitch-shifter.js
function hannWindow(length) {
  var window = new Float32Array(length);
  for (var i = 0; i < length; i++) {
    window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
  }
  return window;
};

function linearInterpolation(a, b, t) {
  return a + (b - a) * t;
};

// audio transformations
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var filter = context.createBiquadFilter();
var grainSize = 1024;
var pitchRatio = 0.9;
var overlapRatio = 0.50;
var pitchShifter = context.createScriptProcessor(grainSize, 1, 1);
  pitchShifter.buffer = new Float32Array(grainSize * 2);
  pitchShifter.grainWindow = hannWindow(grainSize);
  pitchShifter.onaudioprocess = function(event) {
    var inputData = event.inputBuffer.getChannelData(0);
    var outputData = event.outputBuffer.getChannelData(0);
    for (i = 0; i < inputData.length; i++) {
        // Apply the window to the input buffer
        inputData[i] *= this.grainWindow[i];
        // Shift half of the buffer
        this.buffer[i] = this.buffer[i + grainSize];
        // Empty the buffer tail
        this.buffer[i + grainSize] = 0.0;
    }
    // Calculate the pitch shifted grain re-sampling and looping the input
    var grainData = new Float32Array(grainSize * 2);
    for (var i = 0, j = 0.0; i < grainSize; i++, j += pitchRatio) {
        var index = Math.floor(j) % grainSize;
        var a = inputData[index];
        var b = inputData[(index + 1) % grainSize];
        grainData[i] += linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
    }
    // Copy the grain multiple times overlapping it
    for (i = 0; i < grainSize; i += Math.round(grainSize * (1 - overlapRatio))) {
        for (j = 0; j <= grainSize; j++) {
            this.buffer[i + j] += grainData[j];
        }
    }
    // Output the first half of the buffer
    for (i = 0; i < grainSize; i++) {
        outputData[i] = this.buffer[i];
    }
  };
var myDelay = context.createDelay(5.0);
  myDelay.delayTime.value = 5.0;
var analyser = context.createAnalyser();
  analyser.minDecibels = -80;
  analyser.maxDecibels = -60;
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.2;

navigator.getUserMedia({audio: true}, function(stream) {
  var microphone = context.createMediaStreamSource(stream);
  // microphone -> filter -> pitchShifter -> myDelay -> analyser -> destination.
  microphone.connect(filter);
  filter.connect(pitchShifter);
  pitchShifter.connect(myDelay);
  myDelay.connect(analyser)
  analyser.connect(context.destination);
}, function(error) {
  console.log("Error: " + error);
});

// scene
var scene = new THREE.Scene;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 50;

// lights
var light1 = new THREE.DirectionalLight(0x0000ff);
light1.position.set(0, 0, 1000);
scene.add(light1);
var light2 = new THREE.DirectionalLight(0x00ff00);
light2.position.set(300, 1000, 0);
scene.add(light2);

// face

// fallback on spheres
const obj = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial());
var head = new Object(obj);
var lipTop = new Object(obj);
var lipBottom = new Object(obj);

// material loader
var mtlLoader = new THREE.MTLLoader();
var url = "Batman_mask.mtl";
mtlLoader.load(url, function(material) {
    material.preload();

    // object loader
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(material);
    objLoader.load("Batman_mask.obj", function(object) {
      head = object;
      scene.add(head);

      // render lips onto object
      lipTop = new THREE.Mesh(new THREE.TorusGeometry(70, 20, 7, 6, Math.PI), new THREE.MeshPhongMaterial());
      lipTop.position.z = -25;
      lipTop.position.y = 40;
      head.add(lipTop);
      lipBottom = new THREE.Mesh(new THREE.TorusGeometry(70, 18, 7, 6, Math.PI), new THREE.MeshPhongMaterial());
      lipBottom.position.z = -25;
      lipBottom.position.y = 40;
      head.add(lipBottom);

      // position head
      head.scale.set(0.1, 0.1, 0.1);
      head.position.set(0, -10, 0);
    });
});

// for mouse tracking
document.addEventListener('mousemove', onDocumentMouseMove, false);
function onDocumentMouseMove( event ) {
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

// runs every frame
function render() {
  requestAnimationFrame(render);

  // head looks towards cursor
  head.rotation.x = Math.atan(mouseY);
	head.rotation.y = Math.atan(mouseX);

  // lips open to volume level
  var array =  new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(array);
  var volume = array.reduce((a, b) => a + b, 0)/array.length;
  lipTop.rotation.x = Math.PI / 2 - Math.atan(0.3 + (volume / 50));
  lipBottom.rotation.x = Math.PI / 2 + Math.atan(0.3 + (volume / 50));

  renderer.render(scene, camera);
}
render();
