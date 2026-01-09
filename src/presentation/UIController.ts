// UI Controller - DOM element management

import { GameController } from '@application/GameController';
import { GameState, GameStatus, GameEvent } from '@domain/types';

export class UIController {
  private scoreEl: HTMLElement;
  private linesEl: HTMLElement;
  private levelEl: HTMLElement;
  private startBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private restartBtn: HTMLButtonElement;
  private gameOverModal: HTMLElement;
  private finalScoreEl: HTMLElement;
  private restartModalBtn: HTMLButtonElement;

  constructor(private gameController: GameController) {
    // Get DOM elements
    this.scoreEl = this.getElement('score');
    this.linesEl = this.getElement('lines');
    this.levelEl = this.getElement('level');
    this.startBtn = this.getElement('start-btn') as HTMLButtonElement;
    this.pauseBtn = this.getElement('pause-btn') as HTMLButtonElement;
    this.restartBtn = this.getElement('restart-btn') as HTMLButtonElement;
    this.gameOverModal = this.getElement('game-over-modal');
    this.finalScoreEl = this.getElement('final-score');
    this.restartModalBtn = this.getElement('restart-modal-btn') as HTMLButtonElement;

    this.setupEventListeners();
    this.subscribeToGameEvents();
    this.updateUI(gameController.store.getState());
  }

  /**
   * Get DOM element by ID
   */
  private getElement(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return el;
  }

  /**
   * Setup button event listeners
   */
  private setupEventListeners(): void {
    this.startBtn.addEventListener('click', () => {
      this.gameController.start();
    });

    this.pauseBtn.addEventListener('click', () => {
      this.gameController.togglePause();
    });

    this.restartBtn.addEventListener('click', () => {
      this.hideGameOverModal();
      this.gameController.restart();
    });

    this.restartModalBtn.addEventListener('click', () => {
      this.hideGameOverModal();
      this.gameController.restart();
    });
  }

  /**
   * Subscribe to game state changes
   */
  private subscribeToGameEvents(): void {
    // Subscribe to store changes
    this.gameController.store.subscribe((state) => {
      this.updateUI(state);
    });

    // Subscribe to game over event
    this.gameController.eventBus.on(GameEvent.GAME_OVER, () => {
      this.showGameOverModal();
    });
  }

  /**
   * Update UI elements based on game state
   */
  private updateUI(state: GameState): void {
    // Update stats
    this.scoreEl.textContent = state.score.toString();
    this.linesEl.textContent = state.lines.toString();
    this.levelEl.textContent = state.level.toString();

    // Update buttons
    this.updateButtons(state.status);
  }

  /**
   * Update button states based on game status
   */
  private updateButtons(status: GameStatus): void {
    switch (status) {
      case GameStatus.MENU:
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start';
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.restartBtn.disabled = true;
        break;

      case GameStatus.PLAYING:
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = 'Pause';
        this.restartBtn.disabled = false;
        break;

      case GameStatus.PAUSED:
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = 'Resume';
        this.restartBtn.disabled = false;
        break;

      case GameStatus.GAME_OVER:
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'New Game';
        this.pauseBtn.disabled = true;
        this.restartBtn.disabled = false;
        break;
    }
  }

  /**
   * Show game over modal
   */
  private showGameOverModal(): void {
    const state = this.gameController.store.getState();
    this.finalScoreEl.textContent = state.score.toString();
    this.gameOverModal.classList.add('show');
  }

  /**
   * Hide game over modal
   */
  private hideGameOverModal(): void {
    this.gameOverModal.classList.remove('show');
  }
}
