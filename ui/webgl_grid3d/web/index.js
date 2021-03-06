var Stats = require('stats-js');
const dat = require('dat.gui');

// WebGL
let canvas = document.getElementById("preview");
var renderer = new THREE.WebGLRenderer({ canvas: canvas });

// Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);

// Add lights
scene.add(new THREE.AmbientLight(0xbbbbbb));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

// Helpers
var box = new THREE.Box3();
box.setFromCenterAndSize( new THREE.Vector3( 50, 50, 50 ), new THREE.Vector3( 100, 100, 100 ) );

var helper = new THREE.Box3Helper( box, 0xffff00 );
scene.add( helper );

// Setup camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(50, 50, 200);

var tbControls = new THREE.TrackballControls(camera, renderer.domElement);
var flyControls = new THREE.FlyControls(camera, renderer.domElement);

var animate = function () {
	// frame cycle
	tbControls.update();
	flyControls.update(1);

	renderer.render(scene, camera);
	stats.update();
	requestAnimationFrame( animate );
};

var width = window.innerWidth * 80 / 100 - 20;
var height = window.innerHeight - 20;
var nodeRelSize = 1;
var nodeResolution = 8;

// Stats
var stats = new Stats();
document.body.appendChild( stats.domElement );
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '15px';
stats.domElement.style.bottom = '20px';

// Dat GUI
const gui = new dat.GUI();

// Objects
var geometry = new THREE.BufferGeometry();
var MAX_POINTS = 100*100*100;
var positions = new Float32Array(MAX_POINTS * 3);
var colors = new Float32Array(MAX_POINTS);
geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3) )
geometry.computeBoundingSphere();

var pMaterial = new THREE.PointsMaterial({
    color: 0xff0000,
    size: 1
});

var particleSystem = new THREE.Points(geometry, pMaterial);
scene.add(particleSystem);

function addData(data) {
    let positions = particleSystem.geometry.attributes.position.array;
    for (var i = 0; i < data.length; i++) {
        positions[i * 3 + 0] = data[i].X;
        positions[i * 3 + 1] = data[i].Y;
        positions[i * 3 + 2] = data[i].Z;

    }
    particleSystem.geometry.setDrawRange(0, data.length);
    particleSystem.geometry.attributes.position.needsUpdate = true;
}
module.exports = { addData };

function resizeCanvas() {
    if (width && height) {
        renderer.setSize(width, height);
        camera.aspect = width/height;
        camera.updateProjectionMatrix();
    }
}
resizeCanvas();
animate();
