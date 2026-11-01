// ============================================
// Player - Third Person Controller
// ============================================
import * as THREE from 'three';

export class Player {
  constructor(scene, camera, input) {
    this.scene = scene;
    this.camera = camera;
    this.input = input;

    // Player state
    this.position = new THREE.Vector3(0, 0, -55);
    this.velocity = new THREE.Vector3();
    this.rotation = 0; // Y rotation
    this.cameraRotationX = 0; // Pitch
    this.cameraRotationY = 0; // Yaw

    // Movement settings
    this.walkSpeed = 6;
    this.runSpeed = 12;
    this.turnSensitivity = 0.002;

    // Vehicle state
    this.isInVehicle = false;
    this.currentVehicle = null;

    // Create player model
    this.mesh = this.createPlayerModel();
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // Camera setup
    this.cameraOffset = new THREE.Vector3(0, 4, 8);
    this.cameraLookOffset = new THREE.Vector3(0, 1.5, 0);
    this.currentCameraPos = new THREE.Vector3();
    this.currentCameraPos.copy(this.position).add(this.cameraOffset);

    // Animation
    this.animTime = 0;
    this.isMoving = false;
  }

  createPlayerModel() {
    const group = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.0, 0.5),
      bodyMat
    );
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Head
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      headMat
    );
    head.position.y = 2.0;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.2, 0.55),
      hairMat
    );
    hair.position.y = 2.3;
    group.add(hair);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    [[-0.12, 2.05, 0.26], [0.12, 2.05, 0.26]].forEach(([x, y, z]) => {
      const eye = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.02),
        eyeMat
      );
      eye.position.set(x, y, z);
      group.add(eye);
    });

    // Arms
    const armMat = new THREE.MeshLambertMaterial({ color: 0x1976D2 });
    const armGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    armGeo.translate(0, -0.4, 0);
    
    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.55, 1.2, 0);
    group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.55, 1.2, 0);
    group.add(this.rightArm);

    // Legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x37474F });
    const legGeo = new THREE.BoxGeometry(0.3, 0.7, 0.3);
    legGeo.translate(0, -0.35, 0);

    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.2, 0.35, 0);
    group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.2, 0.35, 0);
    group.add(this.rightLeg);

    return group;
  }

  update(delta, vehicleManager) {
    if (this.isInVehicle) {
      this.updateInVehicle(delta, vehicleManager);
    } else {
      this.updateOnFoot(delta, vehicleManager);
    }

    this.updateCamera(delta);
  }

  updateOnFoot(delta, vehicleManager) {
    const input = this.input;
    
    // Mouse look
    this.cameraRotationY -= input.mouseMovement.x * this.turnSensitivity;
    this.cameraRotationX -= input.mouseMovement.y * this.turnSensitivity;
    this.cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, this.cameraRotationX));

    // Movement
    const isRunning = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight') || input.isSprinting;
    const speed = isRunning ? this.runSpeed : this.walkSpeed;
    
    let moveX = 0, moveZ = 0;
    if (input.isKeyDown('KeyW')) moveZ -= 1;
    if (input.isKeyDown('KeyS')) moveZ += 1;
    if (input.isKeyDown('KeyA')) moveX -= 1;
    if (input.isKeyDown('KeyD')) moveX += 1;

    if (input.touchMove && (input.touchMove.x !== 0 || input.touchMove.z !== 0)) {
      moveX = input.touchMove.x;
      moveZ = input.touchMove.z;
    }

    this.isMoving = (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1);

    if (this.isMoving) {
      // Direction relative to camera
      const angle = this.cameraRotationY;
      const dir = new THREE.Vector3(
        moveX * Math.cos(angle) - moveZ * Math.sin(angle),
        0,
        moveX * Math.sin(angle) + moveZ * Math.cos(angle)
      ).normalize();

      this.position.x += dir.x * speed * delta;
      this.position.z += dir.z * speed * delta;

      // Rotate player to face movement direction
      this.rotation = Math.atan2(dir.x, dir.z);

      // Walk animation
      this.animTime += delta * (isRunning ? 12 : 8);
      const swing = Math.sin(this.animTime) * 0.5;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
    } else {
      // Idle animation
      this.animTime += delta * 2;
      const breath = Math.sin(this.animTime) * 0.02;
      this.leftArm.rotation.x = breath;
      this.rightArm.rotation.x = breath;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    }

    // Clamp to world bounds
    this.position.x = Math.max(-95, Math.min(95, this.position.x));
    this.position.z = Math.max(-95, Math.min(95, this.position.z));

    // Update mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;

    // Vehicle entry (F key)
    if (input.isKeyJustPressed('KeyF') && vehicleManager) {
      const nearest = vehicleManager.getNearestVehicle(this.position, 4);
      if (nearest) {
        this.enterVehicle(nearest);
      }
    }
  }

  updateInVehicle(delta, vehicleManager) {
    const input = this.input;
    const vehicle = this.currentVehicle;
    if (!vehicle) return;

    // Mouse look (still works in vehicle)
    this.cameraRotationY -= input.mouseMovement.x * this.turnSensitivity;
    this.cameraRotationX -= input.mouseMovement.y * this.turnSensitivity;
    this.cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, this.cameraRotationX));

    // Vehicle controls
    let accel = 0, steer = 0;
    if (input.isKeyDown('KeyW')) accel += 1;
    if (input.isKeyDown('KeyS')) accel -= 0.5;
    if (input.isKeyDown('KeyA')) steer += 1;
    if (input.isKeyDown('KeyD')) steer -= 1;

    if (input.touchMove && (input.touchMove.x !== 0 || input.touchMove.z !== 0)) {
      if (input.touchMove.z < -0.1) accel = -input.touchMove.z;
      else if (input.touchMove.z > 0.1) accel = -input.touchMove.z * 0.5;
      steer = -input.touchMove.x;
    }

    // Update vehicle physics
    const maxSpeed = 25;
    const acceleration = 15;
    const friction = 5;
    const turnSpeed = 2.5;

    vehicle.speed += accel * acceleration * delta;
    vehicle.speed -= vehicle.speed * friction * delta;
    vehicle.speed = Math.max(-maxSpeed * 0.3, Math.min(maxSpeed, vehicle.speed));

    if (Math.abs(vehicle.speed) > 0.1) {
      vehicle.rotation += steer * turnSpeed * delta * Math.sign(vehicle.speed);
    }

    vehicle.mesh.rotation.y = vehicle.rotation;
    vehicle.mesh.position.x += Math.sin(vehicle.rotation) * vehicle.speed * delta;
    vehicle.mesh.position.z += Math.cos(vehicle.rotation) * vehicle.speed * delta;

    // Clamp
    vehicle.mesh.position.x = Math.max(-95, Math.min(95, vehicle.mesh.position.x));
    vehicle.mesh.position.z = Math.max(-95, Math.min(95, vehicle.mesh.position.z));

    // Sync player position
    this.position.copy(vehicle.mesh.position);
    this.rotation = vehicle.rotation;
    this.mesh.position.copy(this.position);
    this.mesh.position.y = 1; // Sitting height
    this.mesh.rotation.y = this.rotation;
    this.mesh.visible = false;

    // Exit vehicle (F key)
    if (input.isKeyJustPressed('KeyF')) {
      this.exitVehicle();
    }
  }

  enterVehicle(vehicle) {
    this.isInVehicle = true;
    this.currentVehicle = vehicle;
    vehicle.isOccupied = true;
    this.mesh.visible = false;
    document.getElementById('vehicle-indicator').style.display = 'block';
  }

  exitVehicle() {
    if (!this.currentVehicle) return;
    this.currentVehicle.isOccupied = false;
    this.currentVehicle.speed = 0;
    this.isInVehicle = false;

    // Position player next to vehicle
    const offset = new THREE.Vector3(2, 0, 0);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentVehicle.rotation);
    this.position.copy(this.currentVehicle.mesh.position).add(offset);
    this.position.y = 0;
    
    this.currentVehicle = null;
    this.mesh.visible = true;
    this.mesh.position.copy(this.position);
    document.getElementById('vehicle-indicator').style.display = 'none';
  }

  updateCamera(delta) {
    // Calculate desired camera position
    const rotY = this.cameraRotationY;
    const rotX = this.cameraRotationX;

    const distance = this.isInVehicle ? 12 : 8;
    const heightOffset = this.isInVehicle ? 5 : 4;

    const desiredPos = new THREE.Vector3(
      this.position.x + Math.sin(rotY) * distance * Math.cos(rotX),
      this.position.y + heightOffset + Math.sin(rotX) * distance,
      this.position.z + Math.cos(rotY) * distance * Math.cos(rotX)
    );

    // Smooth follow
    const smoothing = 8;
    this.currentCameraPos.lerp(desiredPos, 1 - Math.exp(-smoothing * delta));

    this.camera.position.copy(this.currentCameraPos);

    // Look at player
    const lookTarget = this.position.clone();
    lookTarget.y += 1.5;
    this.camera.lookAt(lookTarget);
  }
}
