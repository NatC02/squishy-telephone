import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { WiggleRigHelper } from "wiggle/helper";
// import { WiggleBone } from "wiggle";
import { WiggleBone } from "wiggle/spring";

let cameraPersp, currentCamera;
let scene, renderer, control, orbit;

const loader = new GLTFLoader();

const wiggleBones = [];

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
  currentCamera = cameraPersp;

  currentCamera.position.set(5, 2.5, 5);

  scene = new THREE.Scene();
  scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444));

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(1, 1, 1);
  scene.add(light);

  orbit = new OrbitControls(currentCamera, renderer.domElement);
  orbit.update();

  control = new TransformControls(currentCamera, renderer.domElement);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });

  loader.load("/tel.glb", (gltf) => {
    scene.add(gltf.scene);

    gltf.scene.scale.set(3, 3, 3); // Scale the model by a factor of 2 on x, y, z axes

    console.log("Objects in GLB file:");
    gltf.scene.traverse((child) => {
      console.log(child.name, child); // Log object names and their details
    });
  
    const helper = new WiggleRigHelper({
      skeleton: scene.getObjectByName("Tel").skeleton,
      dotSize: 0.2,
      lineWidth: 0.02,
    });
    // scene.add(helper);
  
    const root = scene.getObjectByName("Root");
    // const lb1 = scene.getObjectByName("lb1"); For this bone we dont put any type of attributes using WiggleBones.push because we simply add a custom attribute in our model as a custom property to make it a static bone. We only define wiggle bones using this lib, our custom model is where we declare static bones individual
    const lb2 = scene.getObjectByName("lb2");
  
    wiggleBones.push(new WiggleBone(lb2, { stiffness: 700, damping: 33 }));

    // const rRoot = scene.getObjectByName("rootL");
    // const lb1 = scene.getObjectByName("lb1");
    const rb2 = scene.getObjectByName("rb2");
  
    wiggleBones.push(new WiggleBone(rb2, { stiffness: 700, damping: 33 }));
  
    control.attach(root);

  });
  scene.add(control);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function loop() {
  requestAnimationFrame(loop);
  wiggleBones.forEach((wb) => wb.update());
  render();
}

loop();

function render() {
  renderer.render(scene, currentCamera);
}
