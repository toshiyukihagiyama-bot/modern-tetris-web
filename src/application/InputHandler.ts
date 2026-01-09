// Input handling with DAS (Delayed Auto Shift) and ARR (Auto Repeat Rate)

import { GameActions } from '@domain/GameActions';
import { KeyCode, DAS_DELAY, ARR_INTERVAL } from '@infrastructure/constants';

interface KeyState {
  isPressed: boolean;
  lastPressTime: number;
  repeatTime: number;
}

export class InputHandler {
  private keyStates: Map<string, KeyState>;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(private gameActions: GameActions) {
    this.keyStates = new Map();
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Start listening to keyboard events
   */
  public start(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  /**
   * Stop listening to keyboard events
   */
  public stop(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keyStates.clear();
  }

  /**
   * Handle key down event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.code;

    // Prevent default for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    // Track key state
    const keyState = this.keyStates.get(key);
    const now = Date.now();

    if (!keyState || !keyState.isPressed) {
      // First press or key was released
      this.keyStates.set(key, {
        isPressed: true,
        lastPressTime: now,
        repeatTime: now + DAS_DELAY,
      });

      // Handle immediate action
      this.handleKeyAction(key);
    }
  }

  /**
   * Handle key up event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.code;
    this.keyStates.delete(key);
  }

  /**
   * Update input state (called every frame for DAS/ARR)
   */
  public update(): void {
    const now = Date.now();

    this.keyStates.forEach((state, key) => {
      if (!state.isPressed) return;

      // Check if we should repeat the action
      if (now >= state.repeatTime) {
        this.handleKeyAction(key);
        state.repeatTime = now + ARR_INTERVAL;
      }
    });
  }

  /**
   * Handle key action based on key code
   */
  private handleKeyAction(key: string): void {
    switch (key) {
      // Move left
      case KeyCode.LEFT:
      case KeyCode.A:
        this.gameActions.moveLeft();
        break;

      // Move right
      case KeyCode.RIGHT:
      case KeyCode.D:
        this.gameActions.moveRight();
        break;

      // Soft drop (handled by DAS/ARR)
      case KeyCode.DOWN:
      case KeyCode.S:
        this.gameActions.softDrop();
        break;

      // Rotate clockwise (one-time action, no repeat)
      case KeyCode.UP:
      case KeyCode.W:
      case KeyCode.X:
        if (this.isFirstPress(key)) {
          this.gameActions.rotate('clockwise');
        }
        break;

      // Rotate counterclockwise (one-time action, no repeat)
      case KeyCode.Z:
      case KeyCode.CTRL:
        if (this.isFirstPress(key)) {
          this.gameActions.rotate('counterclockwise');
        }
        break;

      // Hard drop (one-time action, no repeat)
      case KeyCode.SPACE:
        if (this.isFirstPress(key)) {
          this.gameActions.hardDrop();
        }
        break;

      // Hold piece (one-time action, no repeat)
      case KeyCode.C:
      case KeyCode.SHIFT:
        if (this.isFirstPress(key)) {
          this.gameActions.hold();
        }
        break;

      // Pause/Resume (one-time action, no repeat)
      case KeyCode.P:
      case KeyCode.ESCAPE:
        if (this.isFirstPress(key)) {
          this.handlePauseToggle();
        }
        break;
    }
  }

  /**
   * Check if this is the first press of a key (for one-time actions)
   */
  private isFirstPress(key: string): boolean {
    const state = this.keyStates.get(key);
    if (!state) return false;

    const now = Date.now();
    return now < state.repeatTime;
  }

  /**
   * Toggle pause/resume
   */
  private handlePauseToggle(): void {
    // This will be handled by GameController
    // For now, we'll emit both pause and resume
    // GameController will decide based on current state
    this.gameActions.pause();
    this.gameActions.resume();
  }

  /**
   * Check if a key is a game control key
   */
  private isGameKey(key: string): boolean {
    const gameKeys = [
      KeyCode.LEFT,
      KeyCode.RIGHT,
      KeyCode.DOWN,
      KeyCode.UP,
      KeyCode.SPACE,
      KeyCode.Z,
      KeyCode.X,
      KeyCode.C,
      KeyCode.P,
      KeyCode.ESCAPE,
      KeyCode.A,
      KeyCode.D,
      KeyCode.S,
      KeyCode.W,
      KeyCode.SHIFT,
      KeyCode.CTRL,
    ];
    return gameKeys.includes(key as KeyCode);
  }
}
