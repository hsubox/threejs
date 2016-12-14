var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50;
  var n_samples = 44100;
  var curve = new Float32Array(n_samples);
  var deg = Math.PI / 180;
  for (var i = 0; i < n_samples; i++) {
    var x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// audio transformations
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var filter = context.createBiquadFilter();
var distortion = context.createWaveShaper();
distortion.curve = makeDistortionCurve(100);
var analyser = context.createAnalyser();
  analyser.minDecibels = -70;
  analyser.maxDecibels = -50;
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.3;

navigator.getUserMedia({audio: true}, function(stream) {
  var microphone = context.createMediaStreamSource(stream);
  // microphone -> filter -> analyser -> destination.
  microphone.connect(filter);
  filter.connect(distortion);
  distortion.connect(analyser);
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
      lipTop = new THREE.Mesh(new THREE.TorusGeometry(70, 20), new THREE.MeshPhongMaterial());
      lipTop.position.z = -25;
      lipTop.position.y = 40;
      head.add(lipTop);
      lipBottom = new THREE.Mesh(new THREE.TorusGeometry(70, 18), new THREE.MeshPhongMaterial());
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
