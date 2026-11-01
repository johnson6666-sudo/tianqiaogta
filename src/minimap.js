// ============================================
// Minimap - Top-down mini map display
// ============================================
import * as THREE from 'three';

export class Minimap {
  constructor(player, world, missionSystem, vehicleManager) {
    this.player = player;
    this.world = world;
    this.missionSystem = missionSystem;
    this.vehicleManager = vehicleManager;

    this.canvas = document.getElementById('minimap-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.size = 180;
    this.mapRange = 100; // World coords range (-100 to 100)

    // Mission NPC positions (for markers)
    this.missionMarkers = [
      { id: 'npc_market', x: 40, z: -40, color: '#e74c3c', label: '1' },
      { id: 'npc_temple', x: -40, z: 40, color: '#f39c12', label: '2' },
      { id: 'npc_mechanic', x: 40, z: 40, color: '#3498db', label: '3' },
    ];

    this.homePosition = { x: 0, z: -60 };
  }

  worldToMap(wx, wz) {
    const px = ((wx + this.mapRange) / (this.mapRange * 2)) * this.size;
    const py = ((wz + this.mapRange) / (this.mapRange * 2)) * this.size;
    return { x: px, y: py };
  }

  update() {
    const ctx = this.ctx;
    const s = this.size;

    // Clear
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, s, s);

    // Draw grass blocks
    ctx.fillStyle = '#2d4a2d';
    ctx.fillRect(0, 0, s, s);

    // Draw roads
    ctx.fillStyle = '#444';
    const roadWidth = (8 / (this.mapRange * 2)) * s;

    // Horizontal roads at z = -40, 0, 40
    [-40, 0, 40].forEach(z => {
      const pos = this.worldToMap(-100, z);
      ctx.fillRect(0, pos.y - roadWidth / 2, s, roadWidth);
    });

    // Vertical roads at x = -40, 0, 40
    [-40, 0, 40].forEach(x => {
      const pos = this.worldToMap(x, -100);
      ctx.fillRect(pos.x - roadWidth / 2, 0, roadWidth, s);
    });

    // Draw buildings (simplified blocks)
    ctx.fillStyle = '#666';
    this.world.buildings.forEach(b => {
      const pos = this.worldToMap(b.x, b.z);
      const w = (b.width / (this.mapRange * 2)) * s;
      const d = (b.depth / (this.mapRange * 2)) * s;
      ctx.fillRect(pos.x - w / 2, pos.y - d / 2, w, d);
    });

    // Draw home
    const homePos = this.worldToMap(this.homePosition.x, this.homePosition.z);
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(homePos.x, homePos.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('家', homePos.x, homePos.y + 3);

    // Draw mission markers
    this.missionMarkers.forEach(marker => {
      const mission = this.missionSystem.missions.find(m => m.npcId === marker.id);
      if (mission && mission.status === 'done') {
        ctx.fillStyle = '#2ecc71'; // Green for completed
      } else if (mission && mission.status === 'active') {
        ctx.fillStyle = '#f1c40f'; // Yellow for active
      } else {
        ctx.fillStyle = marker.color;
      }

      const pos = this.worldToMap(marker.x, marker.z);
      
      // Draw diamond shape
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - 5);
      ctx.lineTo(pos.x + 4, pos.y);
      ctx.lineTo(pos.x, pos.y + 5);
      ctx.lineTo(pos.x - 4, pos.y);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, pos.x, pos.y + 3);
    });

    // Draw vehicles
    ctx.fillStyle = '#2ecc71';
    this.vehicleManager.vehicles.forEach(v => {
      if (v.isOccupied) return;
      const pos = this.worldToMap(v.mesh.position.x, v.mesh.position.z);
      ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
    });

    // Draw player
    const playerPos = this.worldToMap(this.player.position.x, this.player.position.z);
    
    // Player direction indicator (triangle)
    ctx.save();
    ctx.translate(playerPos.x, playerPos.y);
    ctx.rotate(this.player.cameraRotationY);

    ctx.fillStyle = this.player.isInVehicle ? '#2ecc71' : '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, s, s);

    // Compass
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', s / 2, 12);
  }
}
