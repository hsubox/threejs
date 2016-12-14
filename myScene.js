var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// audio input (microphone)
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var analyser = context.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 1024;
navigator.getUserMedia({audio: true}, function(stream) {
  var microphone = context.createMediaStreamSource(stream);
  var filter = context.createBiquadFilter();
  // microphone -> filter -> destination.
  microphone.connect(analyser);
  analyser.connect(filter);
  filter.connect(context.destination);
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
// fallback on sphere
var obj = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshPhongMaterial());
var lipTop = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshPhongMaterial());
var lipBottom = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshPhongMaterial());
var mtlLoader = new THREE.MTLLoader();
var url = "Batman_mask.mtl";
mtlLoader.load(url, function(material) {
    material.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(material);
    objLoader.load("Batman_mask.obj", function(object) {
      obj = object;
      scene.add(obj);
      // mouth
      lipTop = new THREE.Mesh(new THREE.TorusGeometry(70, 20), new THREE.MeshPhongMaterial());
      lipBottom = new THREE.Mesh(new THREE.TorusGeometry(70, 18), new THREE.MeshPhongMaterial());
      lipTop.position.z = -25;
      lipTop.position.y = 40;
      obj.add(lipTop);
      lipBottom.position.z = -25;
      lipBottom.position.y = 40;
      obj.add(lipBottom);
      object.scale.set(0.1, 0.1, 0.1);
      object.position.set(0, -10, 0);
    });
});

document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove( event ) {
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function render() {
  requestAnimationFrame(render);

  obj.rotation.x = Math.atan(mouseY);
	obj.rotation.y = Math.atan(mouseX);

  var array =  new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(array);
  var volume = array.reduce((a, b) => a + b, 0)/array.length;

  lipTop.rotation.x = Math.PI / 2 - Math.atan(0.3 + (volume / 50));
  lipBottom.rotation.x = Math.PI / 2 + Math.atan(0.3 + (volume / 50));

  renderer.render(scene, camera);
}
render();
