// ============================================
// NPC System - Walking NPCs and Mission NPCs
// ============================================
import * as THREE from 'three';

const NPC_COLORS = [
  { body: 0xe74c3c, legs: 0x2c3e50 }, // Red shirt
  { body: 0xf39c12, legs: 0x34495e }, // Orange shirt
  { body: 0x9b59b6, legs: 0x2c3e50 }, // Purple shirt
  { body: 0x1abc9c, legs: 0x34495e }, // Teal shirt
  { body: 0xe67e22, legs: 0x2c3e50 }, // Dark orange
  { body: 0x3498db, legs: 0x34495e }, // Blue shirt
  { body: 0x2ecc71, legs: 0x2c3e50 }, // Green shirt
  { body: 0xf1c40f, legs: 0x34495e }, // Yellow shirt
];

// Skin colors for diversity
const SKIN_COLORS = [0xffcc99, 0xf0c08a, 0xd4a76a, 0xc69c6d, 0xe8c399];

export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this.missionNPCs = [];

    this.createWalkingNPCs(25);
    this.createMissionNPCs();
  }

  createNPCModel(colorScheme, skinColor, isMissionNPC = false) {
    const group = new THREE.Group();
    
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorScheme.body });
    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const legMat = new THREE.MeshLambertMaterial({ color: colorScheme.legs });

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.4),
      bodyMat
    );
    body.position.y = 1.15;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.45),
      skinMat
    );
    head.position.y = 1.9;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairColor = [0x333333, 0x222222, 0x4a3728, 0x1a1a1a][Math.floor(Math.random() * 4)];
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.5),
      new THREE.MeshLambertMaterial({ color: hairColor })
    );
    hair.position.y = 2.18;
    group.add(hair);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    [[-0.1, 1.95, 0.24], [0.1, 1.95, 0.24]].forEach(([x, y, z]) => {
      const eye = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.06, 0.02),
        eyeMat
      );
      eye.position.set(x, y, z);
      group.add(eye);
    });

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    armGeo.translate(0, -0.35, 0);

    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.5, 1.15, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.5, 1.15, 0);
    group.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    legGeo.translate(0, -0.35, 0);

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.17, 0.35, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.17, 0.35, 0);
    group.add(rightLeg);

    // Mission NPC special indicator
    if (isMissionNPC) {
      // Floating exclamation mark (yellow diamond)
      const indicator = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.MeshBasicMaterial({ color: 0xf1c40f })
      );
      indicator.position.y = 2.8;
      indicator.name = 'indicator';
      group.add(indicator);
    }

    return { group, leftArm, rightArm, leftLeg, rightLeg };
  }

  createWalkingNPCs(count) {
    // Define walking paths along sidewalks
    const paths = [
      // Horizontal walks along z=0 road
      { points: [new THREE.Vector3(-80, 0, 6), new THREE.Vector3(80, 0, 6)] },
      { points: [new THREE.Vector3(80, 0, -6), new THREE.Vector3(-80, 0, -6)] },
      // Along z=40 road
      { points: [new THREE.Vector3(-80, 0, 46), new THREE.Vector3(80, 0, 46)] },
      { points: [new THREE.Vector3(80, 0, 34), new THREE.Vector3(-80, 0, 34)] },
      // Along z=-40 road
      { points: [new THREE.Vector3(-80, 0, -34), new THREE.Vector3(80, 0, -34)] },
      { points: [new THREE.Vector3(80, 0, -46), new THREE.Vector3(-80, 0, -46)] },
      // Vertical walks along x=0 road
      { points: [new THREE.Vector3(6, 0, -80), new THREE.Vector3(6, 0, 80)] },
      { points: [new THREE.Vector3(-6, 0, 80), new THREE.Vector3(-6, 0, -80)] },
      // Along x=40
      { points: [new THREE.Vector3(46, 0, -80), new THREE.Vector3(46, 0, 80)] },
      { points: [new THREE.Vector3(34, 0, 80), new THREE.Vector3(34, 0, -80)] },
      // Along x=-40
      { points: [new THREE.Vector3(-34, 0, -80), new THREE.Vector3(-34, 0, 80)] },
      { points: [new THREE.Vector3(-46, 0, 80), new THREE.Vector3(-46, 0, -80)] },
    ];

    for (let i = 0; i < count; i++) {
      const colorScheme = NPC_COLORS[Math.floor(Math.random() * NPC_COLORS.length)];
      const skinColor = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)];
      const { group, leftArm, rightArm, leftLeg, rightLeg } = this.createNPCModel(colorScheme, skinColor);

      const path = paths[Math.floor(Math.random() * paths.length)];
      const progress = Math.random();
      const startPos = path.points[0].clone().lerp(path.points[1], progress);

      group.position.copy(startPos);
      this.scene.add(group);

      this.npcs.push({
        mesh: group,
        leftArm, rightArm, leftLeg, rightLeg,
        path: path,
        progress: progress,
        speed: 1.5 + Math.random() * 1.5,
        direction: 1,
        animTime: Math.random() * Math.PI * 2,
        isMission: false,
      });
    }
  }

  createMissionNPCs() {
    // Three mission NPCs at specific locations
    const missionData = [
      {
        id: 'npc_market',
        name: '阿姨 (市場老闆娘)',
        position: new THREE.Vector3(40, 0, -40),
        color: { body: 0xff6b6b, legs: 0x2c3e50 },
      },
      {
        id: 'npc_temple',
        name: '道長 (天橋寺住持)',
        position: new THREE.Vector3(-40, 0, 40),
        color: { body: 0xf39c12, legs: 0x8b6914 },
      },
      {
        id: 'npc_mechanic',
        name: '小陳 (車行老闆)',
        position: new THREE.Vector3(40, 0, 40),
        color: { body: 0x555555, legs: 0x333333 },
      },
    ];

    missionData.forEach(data => {
      const skinColor = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)];
      const { group, leftArm, rightArm, leftLeg, rightLeg } = this.createNPCModel(data.color, skinColor, true);

      group.position.copy(data.position);
      this.scene.add(group);

      const npc = {
        mesh: group,
        leftArm, rightArm, leftLeg, rightLeg,
        id: data.id,
        name: data.name,
        position: data.position.clone(),
        isMission: true,
        animTime: 0,
        missionComplete: false,
      };

      this.npcs.push(npc);
      this.missionNPCs.push(npc);
    });
  }

  update(delta, player) {
    this.npcs.forEach(npc => {
      if (npc.isMission) {
        // Mission NPCs idle animation
        npc.animTime += delta * 2;
        const sway = Math.sin(npc.animTime) * 0.05;
        npc.leftArm.rotation.x = sway;
        npc.rightArm.rotation.x = -sway;

        // Floating indicator animation
        const indicator = npc.mesh.getObjectByName('indicator');
        if (indicator) {
          indicator.position.y = 2.8 + Math.sin(npc.animTime * 2) * 0.2;
          indicator.rotation.y += delta * 2;

          // Hide indicator if mission complete
          if (npc.missionComplete) {
            indicator.visible = false;
          }
        }

        // Face player when close
        const dist = npc.position.distanceTo(player.position);
        if (dist < 8) {
          const dx = player.position.x - npc.position.x;
          const dz = player.position.z - npc.position.z;
          npc.mesh.rotation.y = Math.atan2(dx, dz);
        }
      } else {
        // Walking NPCs - move along path
        const path = npc.path;
        const start = path.points[0];
        const end = path.points[1];
        const totalDist = start.distanceTo(end);

        npc.progress += (npc.speed / totalDist) * delta * npc.direction;

        if (npc.progress >= 1) {
          npc.progress = 1;
          npc.direction = -1;
        } else if (npc.progress <= 0) {
          npc.progress = 0;
          npc.direction = 1;
        }

        // Interpolate position
        npc.mesh.position.lerpVectors(start, end, npc.progress);

        // Face walking direction
        const dir = end.clone().sub(start).normalize();
        if (npc.direction < 0) dir.negate();
        npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);

        // Walk animation
        npc.animTime += delta * 6;
        const swing = Math.sin(npc.animTime) * 0.4;
        npc.leftArm.rotation.x = swing;
        npc.rightArm.rotation.x = -swing;
        npc.leftLeg.rotation.x = -swing;
        npc.rightLeg.rotation.x = swing;
      }
    });
  }

  getNearMissionNPC(position, radius = 4) {
    for (const npc of this.missionNPCs) {
      if (npc.position.distanceTo(position) < radius) {
        return npc;
      }
    }
    return null;
  }
}
