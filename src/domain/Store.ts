// ES Proxy-based reactive state management

import { StoreSubscriber } from './types';

export class Store<T extends object> {
  private state: T;
  private subscribers: Set<StoreSubscriber<T>>;

  constructor(initialState: T) {
    this.state = initialState;
    this.subscribers = new Set();
  }

  /**
   * Get the current state (read-only)
   */
  public getState(): Readonly<T> {
    return this.state;
  }

  /**
   * Update the state (immutable partial update)
   */
  public setState(partialState: Partial<T>): void {
    // Merge with existing state
    this.state = {
      ...this.state,
      ...partialState,
    };

    // Notify all subscribers
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(subscriber: StoreSubscriber<T>): () => void {
    this.subscribers.add(subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.state);
    });
  }

  /**
   * Clear all subscribers
   */
  public clearSubscribers(): void {
    this.subscribers.clear();
  }

  /**
   * Reset state to a new state
   */
  public reset(newState: T): void {
    this.state = newState;
    this.notifySubscribers();
  }
}
