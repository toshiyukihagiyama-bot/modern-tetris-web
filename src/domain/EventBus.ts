// Event Bus for pub/sub pattern (loose coupling between layers)

import { GameEvent, EventHandler } from './types';

export class EventBus {
  private events: Map<GameEvent, Set<EventHandler<unknown>>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   */
  public on<T = unknown>(event: GameEvent, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler as EventHandler<unknown>);
  }

  /**
   * Unsubscribe from an event
   */
  public off<T = unknown>(event: GameEvent, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  public emit<T = unknown>(event: GameEvent, data?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Clear all event handlers
   */
  public clear(): void {
    this.events.clear();
  }

  /**
   * Remove all handlers for a specific event
   */
  public clearEvent(event: GameEvent): void {
    this.events.delete(event);
  }
}
