var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

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
var obj;
var mtlLoader = new THREE.MTLLoader();
var url = "Batman_mask.mtl";
mtlLoader.load(url, function(material) {
    material.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(material);
    objLoader.load("Batman_mask.obj", function(object) {
      object.scale.set(0.1, 0.1, 0.1);
      object.position.set(0, -10, 0);
      obj = object;
      scene.add(obj);
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

  renderer.render(scene, camera);
}
render();
