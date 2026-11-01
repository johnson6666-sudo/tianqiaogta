// ============================================
// Tianqiao GTA - Main Entry Point
// ============================================
import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { NPCManager } from './npc.js';
import { VehicleManager } from './vehicle.js';
import { MissionSystem } from './missions.js';
import { Minimap } from './minimap.js';
import { InputManager } from './input.js';

// Global game state
const GameState = {
  scene: null,
  camera: null,
  renderer: null,
  clock: new THREE.Clock(),
  player: null,
  world: null,
  npcManager: null,
  vehicleManager: null,
  missionSystem: null,
  minimap: null,
  input: null,
  isRunning: false,
  isLoaded: false,
};

// Loading simulation
let loadProgress = 0;
const loadingBar = document.getElementById('loading-bar');
const loadingInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadingInterval);
    document.getElementById('start-btn').style.display = 'block';
    GameState.isLoaded = true;
  }
  loadingBar.style.width = loadProgress + '%';
}, 200);

// Initialize Three.js
function initThree() {
  // Scene
  GameState.scene = new THREE.Scene();
  GameState.scene.background = new THREE.Color(0x87CEEB);
  GameState.scene.fog = new THREE.Fog(0x87CEEB, 80, 200);

  // Camera
  GameState.camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 500
  );

  // Renderer
  GameState.renderer = new THREE.WebGLRenderer({ antialias: true });
  GameState.renderer.setSize(window.innerWidth, window.innerHeight);
  GameState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  GameState.renderer.shadowMap.enabled = true;
  GameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  GameState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  GameState.renderer.toneMappingExposure = 1.2;
  document.body.appendChild(GameState.renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  GameState.scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(50, 80, 30);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.camera.left = -80;
  dirLight.shadow.camera.right = 80;
  dirLight.shadow.camera.top = 80;
  dirLight.shadow.camera.bottom = -80;
  GameState.scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x556B2F, 0.4);
  GameState.scene.add(hemiLight);

  // Resize handler
  window.addEventListener('resize', () => {
    GameState.camera.aspect = window.innerWidth / window.innerHeight;
    GameState.camera.updateProjectionMatrix();
    GameState.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Initialize game systems
function initGame() {
  initThree();

  // Input
  GameState.input = new InputManager();

  // World
  GameState.world = new World(GameState.scene);

  // Player
  GameState.player = new Player(GameState.scene, GameState.camera, GameState.input);

  // NPC Manager
  GameState.npcManager = new NPCManager(GameState.scene);

  // Vehicle Manager
  GameState.vehicleManager = new VehicleManager(GameState.scene);

  // Mission System
  GameState.missionSystem = new MissionSystem(GameState.npcManager);

  // Minimap
  GameState.minimap = new Minimap(GameState.player, GameState.world, GameState.missionSystem, GameState.vehicleManager);
}

// Game loop
function gameLoop() {
  if (!GameState.isRunning) return;
  requestAnimationFrame(gameLoop);

  const delta = GameState.clock.getDelta();
  const clampedDelta = Math.min(delta, 0.05);

  // Update systems
  GameState.input.update();
  GameState.player.update(clampedDelta, GameState.vehicleManager);
  GameState.npcManager.update(clampedDelta, GameState.player);
  GameState.vehicleManager.update(clampedDelta, GameState.player);
  GameState.missionSystem.update(GameState.player);
  GameState.minimap.update();

  // Render
  GameState.renderer.render(GameState.scene, GameState.camera);
}

// Start game (called from HTML button)
window.startGame = function() {
  if (!GameState.isLoaded) return;

  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('hud').style.display = 'block';

  // Initialize everything
  initGame();

  // Lock pointer for desktop mouse
  document.body.addEventListener('click', (e) => {
    // Ignore clicks on buttons/touch controls
    if (e.target.closest('#touch-controls') || e.target.closest('#dialogue-box') || e.target.closest('#start-btn')) {
      return;
    }
    if (GameState.isRunning && !GameState.missionSystem?.isDialogueActive && !GameState.input?.isTouchDevice) {
      if (document.body.requestPointerLock) {
        document.body.requestPointerLock();
      }
    }
  });

  GameState.isRunning = true;
  GameState.clock.start();
  gameLoop();

  // Request pointer lock for desktop
  if (!GameState.input?.isTouchDevice && document.body.requestPointerLock) {
    setTimeout(() => document.body.requestPointerLock(), 100);
  }
};
