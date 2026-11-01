// ============================================
// Vehicle System - Electric Scooter
// ============================================
import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];

    this.createVehicles();
  }

  createVehicleModel(color) {
    const group = new THREE.Group();
    
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Main body / chassis
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 2.5),
      bodyMat
    );
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    group.add(chassis);

    // Front panel (raised)
    const frontPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.5),
      bodyMat
    );
    frontPanel.position.set(0, 0.7, -1.0);
    frontPanel.castShadow = true;
    group.add(frontPanel);

    // Handlebar
    const handlebar = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.1),
      metalMat
    );
    handlebar.position.set(0, 1.2, -1.0);
    group.add(handlebar);

    // Handlebar stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6),
      metalMat
    );
    stem.position.set(0, 0.95, -1.0);
    group.add(stem);

    // Headlight
    const headlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffcc })
    );
    headlight.position.set(0, 0.8, -1.3);
    group.add(headlight);

    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.8),
      seatMat
    );
    seat.position.set(0, 0.75, 0.2);
    group.add(seat);

    // Rear rack
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.6),
      metalMat
    );
    rack.position.set(0, 0.65, 1.0);
    group.add(rack);

    // Tail light
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    taillight.position.set(0, 0.5, 1.25);
    group.add(taillight);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 12);
    
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.3, -1.0);
    frontWheel.rotation.z = Math.PI / 2;
    group.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.position.set(0, 0.3, 0.9);
    rearWheel.rotation.z = Math.PI / 2;
    group.add(rearWheel);

    // Fenders
    const fenderGeo = new THREE.BoxGeometry(0.4, 0.05, 0.5);
    const frontFender = new THREE.Mesh(fenderGeo, bodyMat);
    frontFender.position.set(0, 0.55, -1.0);
    group.add(frontFender);

    const rearFender = new THREE.Mesh(fenderGeo, bodyMat);
    rearFender.position.set(0, 0.55, 0.9);
    group.add(rearFender);

    // Floor platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.08, 1.2),
      metalMat
    );
    platform.position.set(0, 0.3, -0.2);
    group.add(platform);

    return group;
  }

  createVehicles() {
    // Place several electric scooters around the map
    const vehicleData = [
      { position: new THREE.Vector3(5, 0, -50), rotation: 0, color: 0x2ecc71 },
      { position: new THREE.Vector3(35, 0, 6), rotation: Math.PI / 2, color: 0x3498db },
      { position: new THREE.Vector3(-35, 0, -6), rotation: -Math.PI / 4, color: 0xe74c3c },
      { position: new THREE.Vector3(45, 0, 45), rotation: Math.PI, color: 0xf39c12 },
      { position: new THREE.Vector3(-50, 0, 35), rotation: Math.PI / 3, color: 0x9b59b6 },
    ];

    vehicleData.forEach(data => {
      const mesh = this.createVehicleModel(data.color);
      mesh.position.copy(data.position);
      mesh.rotation.y = data.rotation;
      this.scene.add(mesh);

      this.vehicles.push({
        mesh,
        position: data.position.clone(),
        rotation: data.rotation,
        speed: 0,
        isOccupied: false,
      });
    });
  }

  getNearestVehicle(position, maxDist) {
    let nearest = null;
    let nearestDist = maxDist;

    this.vehicles.forEach(vehicle => {
      if (vehicle.isOccupied) return;
      const dist = position.distanceTo(vehicle.mesh.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = vehicle;
      }
    });

    return nearest;
  }

  update(delta, player) {
    const btnVehicle = document.getElementById('btn-vehicle');
    const prompt = document.getElementById('interaction-prompt');
    const dialogueBox = document.getElementById('dialogue-box');
    const isDialogueOpen = dialogueBox && dialogueBox.style.display === 'block';

    if (player.isInVehicle) {
      if (btnVehicle) {
        btnVehicle.classList.add('active');
        btnVehicle.querySelector('.btn-label').textContent = '下车';
      }
    } else {
      if (btnVehicle) {
        btnVehicle.classList.remove('active');
        btnVehicle.querySelector('.btn-label').textContent = '上下车';
      }

      const nearest = this.getNearestVehicle(player.position, 4);
      if (nearest) {
        if (btnVehicle) btnVehicle.classList.add('highlight');
        if (!isDialogueOpen) {
          const npcPromptShowing = prompt && prompt.innerHTML.includes('对话');
          if (!npcPromptShowing && prompt) {
            prompt.innerHTML = '按 <kbd>F</kbd> 或点击 上车（电动车）';
            prompt.style.display = 'block';
          }
        }
      } else {
        if (btnVehicle) btnVehicle.classList.remove('highlight');
      }
    }
  }
}
