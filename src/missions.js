// ============================================
// Mission System - Dialogue & Quest Tracking
// ============================================

export class MissionSystem {
  constructor(npcManager) {
    this.npcManager = npcManager;
    this.isDialogueActive = false;
    this.currentDialogue = null;
    this.currentDialogueIndex = 0;
    this.nearbyNPC = null;

    // Mission definitions
    this.missions = [
      {
        id: 'mission_market',
        npcId: 'npc_market',
        title: '市場風波',
        description: '幫阿姨找回被偷的錢包',
        status: 'pending', // pending, active, done
        dialogues: [
          { speaker: '阿姨', text: '哎呀！你是附近的人吧？我的錢包剛剛被一個小賊偷走了！' },
          { speaker: '阿姨', text: '那個賊往天橋方向跑了，你能幫我找回來嗎？拜託了！' },
          { speaker: '你', text: '別擔心阿姨，我一定幫你找回來！' },
          { speaker: '阿姨', text: '太感謝了！找到後回來找我，我請你吃滷肉飯！' },
        ],
        completeDialogues: [
          { speaker: '阿姨', text: '哎呀你真的找回來啦！太感謝你了！' },
          { speaker: '阿姨', text: '來來來，這是你應得的報酬，還有一碗熱騰騰的滷肉飯！' },
          { speaker: '你', text: '不客氣，這是應該做的。' },
        ],
      },
      {
        id: 'mission_temple',
        npcId: 'npc_temple',
        title: '天橋寺的委託',
        description: '幫道長收集三個祈福符',
        status: 'pending',
        dialogues: [
          { speaker: '道長', text: '施主，你面帶善相。貧道有一事相求。' },
          { speaker: '道長', text: '我寺中的三張祈福符被風吹散了，散落在天橋附近各處。' },
          { speaker: '道長', text: '施主若能幫忙尋回，貧道願為施主祈福消災。' },
          { speaker: '你', text: '道長放心，我去找找看。' },
        ],
        completeDialogues: [
          { speaker: '道長', text: '善哉善哉！施主果然心懷善念。' },
          { speaker: '道長', text: '貧道已為施主誦經祈福，願施主一路平安。' },
          { speaker: '你', text: '多謝道長。' },
        ],
      },
      {
        id: 'mission_mechanic',
        npcId: 'npc_mechanic',
        title: '電動車危機',
        description: '幫小陳試騎修好的電動車',
        status: 'pending',
        dialogues: [
          { speaker: '小陳', text: '嘿兄弟！你看起來像個靠譜的人。' },
          { speaker: '小陳', text: '我剛修好一台電動車，但我自己不敢試騎——上次試車把腿摔斷了，哈哈！' },
          { speaker: '小陳', text: '你幫我騎一圈試試看？繞一下天橋就行。' },
          { speaker: '你', text: '沒問題，包在我身上！' },
        ],
        completeDialogues: [
          { speaker: '小陳', text: '怎麼樣？車還行吧？' },
          { speaker: '你', text: '跑得很順，沒問題！' },
          { speaker: '小陳', text: '太好了！以後修車找我，給你打折！' },
        ],
      },
    ];

    // Set up key listener for dialogue
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.handleInteraction();
      }
    });

    window.addEventListener('game-interact', () => {
      this.handleInteraction();
    });

    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) {
      dialogueBox.addEventListener('click', () => {
        if (this.isDialogueActive) {
          this.advanceDialogue();
        }
      });
      dialogueBox.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.isDialogueActive) {
          this.advanceDialogue();
        }
      });
    }

    const promptEl = document.getElementById('interaction-prompt');
    if (promptEl) {
      promptEl.addEventListener('click', () => {
        this.handleInteraction();
      });
    }

    this.updateMissionUI();
  }

  handleInteraction() {
    if (this.isDialogueActive) {
      // Advance or close dialogue
      this.advanceDialogue();
    } else if (this.nearbyNPC) {
      // Start dialogue
      this.startDialogue(this.nearbyNPC);
    }
  }

  startDialogue(npc) {
    const mission = this.missions.find(m => m.npcId === npc.id);
    if (!mission) return;

    this.isDialogueActive = true;
    this.currentDialogueIndex = 0;

    // Choose dialogues based on mission status
    if (mission.status === 'done') {
      // Already completed - show a brief message
      this.currentDialogue = [
        { speaker: npc.name.split(' ')[0], text: '感謝你之前的幫忙！' }
      ];
    } else if (mission.status === 'active') {
      // Complete the mission
      mission.status = 'done';
      npc.missionComplete = true;
      this.currentDialogue = mission.completeDialogues;
      this.updateMissionUI();
      this.checkAllComplete();
    } else {
      // Start new mission
      mission.status = 'active';
      this.currentDialogue = mission.dialogues;
      this.updateMissionUI();
    }

    // Exit pointer lock for dialogue
    document.exitPointerLock();

    this.showDialogueLine();
  }

  showDialogueLine() {
    if (!this.currentDialogue || this.currentDialogueIndex >= this.currentDialogue.length) {
      this.closeDialogue();
      return;
    }

    const line = this.currentDialogue[this.currentDialogueIndex];
    const dialogueBox = document.getElementById('dialogue-box');
    const nameEl = document.getElementById('dialogue-npc-name');
    const textEl = document.getElementById('dialogue-text');

    nameEl.textContent = line.speaker;
    textEl.textContent = line.text;
    dialogueBox.style.display = 'block';
  }

  advanceDialogue() {
    this.currentDialogueIndex++;
    if (this.currentDialogueIndex >= this.currentDialogue.length) {
      this.closeDialogue();
    } else {
      this.showDialogueLine();
    }
  }

  closeDialogue() {
    this.isDialogueActive = false;
    this.currentDialogue = null;
    this.currentDialogueIndex = 0;
    document.getElementById('dialogue-box').style.display = 'none';

    // Re-lock pointer
    setTimeout(() => document.body.requestPointerLock(), 100);
  }

  update(player) {
    if (this.isDialogueActive) return;

    // Check proximity to mission NPCs
    const nearNPC = this.npcManager.getNearMissionNPC(player.position, 4);
    this.nearbyNPC = nearNPC;

    // Update prompt and mobile dialogue button
    const prompt = document.getElementById('interaction-prompt');
    const btnDialogue = document.getElementById('btn-dialogue');

    if (nearNPC && !player.isInVehicle) {
      prompt.innerHTML = `按 <kbd>E</kbd> 或点击 与 ${nearNPC.name} 对话`;
      prompt.style.display = 'block';
      if (btnDialogue) btnDialogue.classList.add('highlight');
    } else {
      if (btnDialogue) btnDialogue.classList.remove('highlight');
      if (!player.isInVehicle) {
        // Check vehicle proximity
        const vehiclePrompt = prompt.innerHTML.includes('上车');
        if (!vehiclePrompt) {
          prompt.style.display = 'none';
        }
      } else {
        prompt.style.display = 'none';
      }
    }

    // Auto-complete mechanic mission if player rode vehicle near NPC
    const mechMission = this.missions.find(m => m.id === 'mission_mechanic');
    if (mechMission && mechMission.status === 'active' && player.isInVehicle) {
      // Mark as ready to complete when they go back to NPC
    }
  }

  updateMissionUI() {
    const list = document.getElementById('mission-list');
    list.innerHTML = '';

    this.missions.forEach(mission => {
      const item = document.createElement('div');
      item.className = `mission-item ${mission.status === 'done' ? 'done' : ''}`;

      const dot = document.createElement('span');
      dot.className = `dot ${mission.status}`;

      const text = document.createElement('span');
      const statusText = mission.status === 'done' ? '✓ ' : mission.status === 'active' ? '► ' : '';
      text.textContent = statusText + mission.title;

      item.appendChild(dot);
      item.appendChild(text);
      list.appendChild(item);
    });
  }

  checkAllComplete() {
    const allDone = this.missions.every(m => m.status === 'done');
    if (allDone) {
      setTimeout(() => {
        const winScreen = document.getElementById('win-screen');
        winScreen.style.display = 'flex';
      }, 2000);
    }
  }
}
