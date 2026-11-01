// ============================================
// Input Manager - Keyboard, Mouse & Mobile Touch
// ============================================
export class InputManager {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};
    this.mouseMovement = { x: 0, y: 0 };
    this._pendingMouse = { x: 0, y: 0 };

    this.touchMove = { x: 0, z: 0 };
    this.isSprinting = false;

    // Detect touch device
    this.isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
                         (window.innerWidth <= 768);

    this.initKeyboardAndMouse();
    this.initTouchControls();
  }

  initKeyboardAndMouse() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener('mousemove', (e) => {
      this._pendingMouse.x += e.movementX || 0;
      this._pendingMouse.y += e.movementY || 0;
    });
  }

  initTouchControls() {
    const touchControls = document.getElementById('touch-controls');
    if (!touchControls) return;

    if (this.isTouchDevice) {
      touchControls.style.display = 'block';
    }

    // 1. Virtual Joystick
    const joystickZone = document.getElementById('joystick-zone');
    const joystickKnob = document.getElementById('joystick-knob');
    let joystickTouchId = null;
    let joystickCenter = { x: 0, y: 0 };
    const maxRadius = 45;

    const handleJoystickStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (joystickTouchId === null) {
          joystickTouchId = touch.identifier;
          const rect = joystickZone.getBoundingClientRect();
          joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleJoystickMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleJoystickEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          joystickTouchId = null;
          this.touchMove.x = 0;
          this.touchMove.z = 0;
          this.keys['KeyW'] = false;
          this.keys['KeyS'] = false;
          this.keys['KeyA'] = false;
          this.keys['KeyD'] = false;
          if (joystickKnob) {
            joystickKnob.style.transform = 'translate(0px, 0px)';
          }
          break;
        }
      }
    };

    const updateJoystick = (clientX, clientY) => {
      const dx = clientX - joystickCenter.x;
      const dy = clientY - joystickCenter.y;
      const dist = Math.hypot(dx, dy);

      let clampedDx = dx;
      let clampedDy = dy;
      if (dist > maxRadius) {
        clampedDx = (dx / dist) * maxRadius;
        clampedDy = (dy / dist) * maxRadius;
      }

      if (joystickKnob) {
        joystickKnob.style.transform = `translate(${clampedDx}px, ${clampedDy}px)`;
      }

      // Normalized coordinates: -1 to 1
      const normX = clampedDx / maxRadius;
      const normZ = clampedDy / maxRadius;

      this.touchMove.x = normX;
      this.touchMove.z = normZ;

      // Also map to virtual keys for compatibility
      this.keys['KeyW'] = normZ < -0.25;
      this.keys['KeyS'] = normZ > 0.25;
      this.keys['KeyA'] = normX < -0.25;
      this.keys['KeyD'] = normX > 0.25;
    };

    if (joystickZone) {
      joystickZone.addEventListener('touchstart', handleJoystickStart, { passive: false });
      window.addEventListener('touchmove', handleJoystickMove, { passive: false });
      window.addEventListener('touchend', handleJoystickEnd, { passive: false });
      window.addEventListener('touchcancel', handleJoystickEnd, { passive: false });
    }

    // 2. Right-side touch drag for camera rotation
    const lookZone = document.getElementById('touch-look-zone');
    let lookTouchId = null;
    let lastLookPos = { x: 0, y: 0 };

    if (lookZone) {
      lookZone.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (lookTouchId === null) {
            lookTouchId = touch.identifier;
            lastLookPos = { x: touch.clientX, y: touch.clientY };
            break;
          }
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === lookTouchId) {
            const dx = touch.clientX - lastLookPos.x;
            const dy = touch.clientY - lastLookPos.y;
            lastLookPos = { x: touch.clientX, y: touch.clientY };

            // Touch look sensitivity factor
            this._pendingMouse.x += dx * 1.6;
            this._pendingMouse.y += dy * 1.6;
            break;
          }
        }
      }, { passive: false });

      const handleLookEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === lookTouchId) {
            lookTouchId = null;
            break;
          }
        }
      };

      window.addEventListener('touchend', handleLookEnd, { passive: false });
      window.addEventListener('touchcancel', handleLookEnd, { passive: false });
    }

    // 3. Action Buttons
    const btnDialogue = document.getElementById('btn-dialogue');
    const btnVehicle = document.getElementById('btn-vehicle');
    const btnSprint = document.getElementById('btn-sprint');

    if (btnDialogue) {
      const triggerDialogue = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerKey('KeyE');
        window.dispatchEvent(new CustomEvent('game-interact'));
      };
      btnDialogue.addEventListener('touchstart', triggerDialogue, { passive: false });
      btnDialogue.addEventListener('click', triggerDialogue);
    }

    if (btnVehicle) {
      const triggerVehicle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerKey('KeyF');
      };
      btnVehicle.addEventListener('touchstart', triggerVehicle, { passive: false });
      btnVehicle.addEventListener('click', triggerVehicle);
    }

    if (btnSprint) {
      const toggleSprint = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        btnSprint.classList.toggle('active', this.isSprinting);
      };
      btnSprint.addEventListener('touchstart', toggleSprint, { passive: false });
      btnSprint.addEventListener('click', toggleSprint);
    }
  }

  triggerKey(code) {
    this.keysJustPressed[code] = true;
    this.keys[code] = true;
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => {
      this.keys[code] = false;
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
    }, 120);
  }

  update() {
    this.mouseMovement.x = this._pendingMouse.x;
    this.mouseMovement.y = this._pendingMouse.y;
    this._pendingMouse.x = 0;
    this._pendingMouse.y = 0;
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  isKeyJustPressed(code) {
    const v = !!this.keysJustPressed[code];
    if (v) this.keysJustPressed[code] = false;
    return v;
  }

  clearJustPressed() {
    this.keysJustPressed = {};
  }
}
