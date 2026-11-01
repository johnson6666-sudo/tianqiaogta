// ============================================
// World Builder - Low-poly city environment
// ============================================
import * as THREE from 'three';

// Color palette (low-poly GTA style)
const COLORS = {
  road: 0x3a3a3a,
  sidewalk: 0x999999,
  grass: 0x4a8c3f,
  building1: 0xd4a373,
  building2: 0xc9b99a,
  building3: 0xa8c5d6,
  building4: 0xe8d5b7,
  building5: 0xb8c4d0,
  building6: 0xd4a5a5,
  roof: 0x8b4513,
  window: 0x4a90d9,
  windowDark: 0x2c5f8a,
  home: 0x4CAF50,
  tree: 0x2d6a2d,
  trunk: 0x6b4226,
  overpass: 0x888888,
  railing: 0x666666,
  streetlight: 0x555555,
};

export class World {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.mapBounds = { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };

    this.createGround();
    this.createRoads();
    this.createOverpass();
    this.createBuildings();
    this.createHome();
    this.createTrees();
    this.createStreetLights();
    this.createDecorations();
  }

  createGround() {
    // Main ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: COLORS.grass });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoads() {
    const roadMat = new THREE.MeshLambertMaterial({ color: COLORS.road });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: COLORS.sidewalk });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Main roads - creating a grid
    const roadWidth = 8;
    const sidewalkWidth = 2;

    // Horizontal roads
    const hRoads = [-40, 0, 40];
    hRoads.forEach(z => {
      // Road surface
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(200, 0.05, roadWidth),
        roadMat
      );
      road.position.set(0, 0.01, z);
      road.receiveShadow = true;
      this.scene.add(road);

      // Center line
      for (let x = -95; x < 95; x += 6) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(3, 0.06, 0.15),
          lineMat
        );
        line.position.set(x, 0.02, z);
        this.scene.add(line);
      }

      // Sidewalks
      [-1, 1].forEach(side => {
        const sw = new THREE.Mesh(
          new THREE.BoxGeometry(200, 0.2, sidewalkWidth),
          sidewalkMat
        );
        sw.position.set(0, 0.1, z + side * (roadWidth / 2 + sidewalkWidth / 2));
        sw.receiveShadow = true;
        this.scene.add(sw);
      });
    });

    // Vertical roads
    const vRoads = [-40, 0, 40];
    vRoads.forEach(x => {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth, 0.05, 200),
        roadMat
      );
      road.position.set(x, 0.01, 0);
      road.receiveShadow = true;
      this.scene.add(road);

      // Center line
      for (let z = -95; z < 95; z += 6) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.06, 3),
          lineMat
        );
        line.position.set(x, 0.02, z);
        this.scene.add(line);
      }

      // Sidewalks
      [-1, 1].forEach(side => {
        const sw = new THREE.Mesh(
          new THREE.BoxGeometry(sidewalkWidth, 0.2, 200),
          sidewalkMat
        );
        sw.position.set(x + side * (roadWidth / 2 + sidewalkWidth / 2), 0.1, 0);
        sw.receiveShadow = true;
        this.scene.add(sw);
      });
    });
  }

  createOverpass() {
    // The iconic overpass (天桥)
    const overpassMat = new THREE.MeshLambertMaterial({ color: COLORS.overpass });
    const railMat = new THREE.MeshLambertMaterial({ color: COLORS.railing });

    // Main bridge deck
    const deckGeo = new THREE.BoxGeometry(30, 0.5, 6);
    const deck = new THREE.Mesh(deckGeo, overpassMat);
    deck.position.set(0, 6, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Pillars
    const pillarGeo = new THREE.BoxGeometry(1.2, 6, 1.2);
    [[-12, 0], [12, 0], [-12, -2], [12, -2], [-12, 2], [12, 2]].forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, overpassMat);
      pillar.position.set(x, 3, z);
      pillar.castShadow = true;
      this.scene.add(pillar);
    });

    // Ramps
    const rampGeo = new THREE.BoxGeometry(10, 0.4, 5);

    // Left ramp
    const leftRamp = new THREE.Mesh(rampGeo, overpassMat);
    leftRamp.position.set(-18, 3, -4);
    leftRamp.rotation.z = Math.PI / 8;
    leftRamp.castShadow = true;
    this.scene.add(leftRamp);

    // Right ramp
    const rightRamp = new THREE.Mesh(rampGeo, overpassMat);
    rightRamp.position.set(18, 3, 4);
    rightRamp.rotation.z = -Math.PI / 8;
    rightRamp.castShadow = true;
    this.scene.add(rightRamp);

    // Railings on the overpass
    const railGeo = new THREE.BoxGeometry(30, 1, 0.15);
    [-2.9, 2.9].forEach(z => {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, 6.7, z);
      this.scene.add(rail);
    });

    // Decorative arches on overpass
    for (let x = -12; x <= 12; x += 6) {
      const arch = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2, 0.3),
        railMat
      );
      arch.position.set(x, 7.2, -2.9);
      this.scene.add(arch);

      const arch2 = arch.clone();
      arch2.position.z = 2.9;
      this.scene.add(arch2);
    }
  }

  createBuildings() {
    const buildingColors = [COLORS.building1, COLORS.building2, COLORS.building3, 
                           COLORS.building4, COLORS.building5, COLORS.building6];
    
    // Building placement data: [x, z, width, height, depth]
    const buildingData = [
      // Northwest block
      [-65, -65, 15, 18, 12], [-65, -50, 10, 12, 10], [-78, -65, 10, 25, 10],
      [-55, -65, 8, 10, 8], [-78, -50, 12, 15, 12],
      // Northeast block
      [55, -65, 12, 20, 15], [70, -65, 10, 14, 10], [55, -50, 14, 22, 12],
      [75, -55, 8, 10, 8], [68, -50, 10, 16, 10],
      // Southwest block
      [-65, 55, 12, 16, 12], [-55, 60, 10, 12, 10], [-78, 55, 15, 20, 12],
      [-65, 70, 8, 8, 8], [-78, 70, 12, 14, 10],
      // Southeast block
      [55, 55, 14, 24, 14], [70, 55, 10, 12, 10], [55, 70, 12, 18, 12],
      [75, 70, 8, 10, 8], [68, 60, 10, 14, 10],
      // Inner blocks (between roads)
      [-20, -20, 10, 12, 8], [-25, -25, 8, 16, 8], [-15, -25, 8, 10, 8],
      [15, -20, 12, 14, 10], [22, -25, 8, 18, 8],
      [-20, 15, 10, 10, 10], [-25, 22, 8, 14, 8],
      [15, 15, 10, 16, 10], [22, 22, 8, 12, 8], [18, 28, 8, 10, 8],
      // Far buildings
      [-85, -20, 8, 30, 8], [85, -20, 8, 28, 8],
      [-85, 20, 10, 22, 10], [85, 20, 10, 20, 10],
      [-20, -85, 10, 16, 10], [20, -85, 10, 18, 10],
      [-20, 85, 10, 14, 10], [20, 85, 10, 20, 10],
    ];

    buildingData.forEach(([x, z, w, h, d], i) => {
      this.createBuilding(x, z, w, h, d, buildingColors[i % buildingColors.length]);
    });
  }

  createBuilding(x, z, width, height, depth, color) {
    const group = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Windows
    const windowMat = new THREE.MeshLambertMaterial({ color: COLORS.window });
    const windowDarkMat = new THREE.MeshLambertMaterial({ color: COLORS.windowDark });
    const windowSize = 1;
    const windowGap = 2.5;

    // Front and back windows
    for (let wy = 2; wy < height - 1; wy += windowGap) {
      for (let wx = -width / 2 + 1.5; wx < width / 2 - 0.5; wx += windowGap) {
        const mat = Math.random() > 0.3 ? windowMat : windowDarkMat;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(windowSize, windowSize, 0.1),
          mat
        );
        win.position.set(wx, wy, depth / 2 + 0.05);
        group.add(win);

        const win2 = win.clone();
        win2.position.z = -depth / 2 - 0.05;
        group.add(win2);
      }
    }

    // Side windows
    for (let wy = 2; wy < height - 1; wy += windowGap) {
      for (let wz = -depth / 2 + 1.5; wz < depth / 2 - 0.5; wz += windowGap) {
        const mat = Math.random() > 0.3 ? windowMat : windowDarkMat;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, windowSize, windowSize),
          mat
        );
        win.position.set(width / 2 + 0.05, wy, wz);
        group.add(win);

        const win2 = win.clone();
        win2.position.x = -width / 2 - 0.05;
        group.add(win2);
      }
    }

    // Roof detail
    if (Math.random() > 0.5) {
      const roofBox = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.4, 1, depth * 0.4),
        new THREE.MeshLambertMaterial({ color: 0x666666 })
      );
      roofBox.position.y = height + 0.5;
      group.add(roofBox);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.buildings.push({ group, x, z, width, depth, height });
  }

  createHome() {
    // Player's home - special building
    const group = new THREE.Group();

    // House body
    const houseMat = new THREE.MeshLambertMaterial({ color: COLORS.home });
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5, 8),
      houseMat
    );
    house.position.y = 2.5;
    house.castShadow = true;
    group.add(house);

    // Roof (pyramid)
    const roofGeo = new THREE.ConeGeometry(6.5, 3, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: COLORS.roof });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 6.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Door
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.5, 0.2),
      doorMat
    );
    door.position.set(0, 1.25, 4.1);
    group.add(door);

    // Windows
    const winMat = new THREE.MeshLambertMaterial({ color: 0xffffcc });
    [[-2, 3, 4.1], [2, 3, 4.1]].forEach(([x, y, z]) => {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 0.15),
        winMat
      );
      win.position.set(x, y, z);
      group.add(win);
    });

    // "家" sign
    const signGeo = new THREE.BoxGeometry(2, 0.8, 0.1);
    const signMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4.5, 4.15);
    group.add(sign);

    // Home marker (floating icon)
    const markerGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(0, 9, 0);
    group.add(marker);

    group.position.set(0, 0, -60);
    this.scene.add(group);
    this.homePosition = new THREE.Vector3(0, 0, -55);
  }

  createTrees() {
    const treeTrunkMat = new THREE.MeshLambertMaterial({ color: COLORS.trunk });
    const treeLeafMat = new THREE.MeshLambertMaterial({ color: COLORS.tree });

    const treePositions = [];
    // Along sidewalks
    for (let i = -90; i < 90; i += 12) {
      treePositions.push([i, 7], [i, -7], [7, i], [-7, i]);
      treePositions.push([i, 47], [i, -47], [47, i], [-47, i]);
    }
    // Parks/green areas
    for (let i = 0; i < 20; i++) {
      treePositions.push([
        Math.random() * 30 - 15 + (Math.random() > 0.5 ? 60 : -60),
        Math.random() * 30 - 15 + (Math.random() > 0.5 ? 60 : -60)
      ]);
    }

    treePositions.forEach(([x, z]) => {
      const tree = new THREE.Group();
      const height = 3 + Math.random() * 2;
      
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, height, 6),
        treeTrunkMat
      );
      trunk.position.y = height / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      const crownSize = 1.5 + Math.random();
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(crownSize, 6, 5),
        treeLeafMat
      );
      crown.position.y = height + crownSize * 0.5;
      crown.castShadow = true;
      tree.add(crown);

      tree.position.set(x, 0, z);
      this.scene.add(tree);
    });
  }

  createStreetLights() {
    const lightMat = new THREE.MeshLambertMaterial({ color: COLORS.streetlight });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });

    for (let i = -80; i <= 80; i += 20) {
      // Along roads
      [6, -6, 46, -46].forEach(offset => {
        const pole = new THREE.Group();
        
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.15, 5, 6),
          lightMat
        );
        post.position.y = 2.5;
        pole.add(post);

        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.1, 0.1),
          lightMat
        );
        arm.position.set(0.75, 5, 0);
        pole.add(arm);

        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 6, 6),
          bulbMat
        );
        bulb.position.set(1.5, 4.8, 0);
        pole.add(bulb);

        // Point light for glow
        const pointLight = new THREE.PointLight(0xffffaa, 0.3, 12);
        pointLight.position.set(1.5, 4.8, 0);
        pole.add(pointLight);

        pole.position.set(i, 0, offset);
        this.scene.add(pole);
      });
    }
  }

  createDecorations() {
    // Benches along sidewalks
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const benchPositions = [
      [10, 7], [-10, 7], [10, -7], [-10, -7],
      [50, 7], [-50, 7], [50, -7], [-50, -7],
    ];

    benchPositions.forEach(([x, z]) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.15, 0.6),
        benchMat
      );
      seat.position.y = 0.5;
      bench.add(seat);

      const back = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.8, 0.1),
        benchMat
      );
      back.position.set(0, 0.8, -0.25);
      bench.add(back);

      // Legs
      [-0.8, 0.8].forEach(lx => {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.5, 0.4),
          benchMat
        );
        leg.position.set(lx, 0.25, 0);
        bench.add(leg);
      });

      bench.position.set(x, 0.2, z);
      this.scene.add(bench);
    });

    // Trash cans
    const trashMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    [[-5, 7], [5, -7], [45, 7], [-45, -7]].forEach(([x, z]) => {
      const trash = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.25, 0.8, 8),
        trashMat
      );
      trash.position.set(x, 0.6, z);
      trash.castShadow = true;
      this.scene.add(trash);
    });

    // Road crossing markings (zebra crossings)
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // At intersections
    [[0, 0], [0, 40], [0, -40], [40, 0], [-40, 0], [40, 40], [-40, -40], [40, -40], [-40, 40]].forEach(([x, z]) => {
      for (let i = -3; i <= 3; i += 1) {
        const mark = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.06, 4),
          markMat
        );
        mark.position.set(x + i, 0.02, z + 6);
        this.scene.add(mark);
      }
    });
  }
}
