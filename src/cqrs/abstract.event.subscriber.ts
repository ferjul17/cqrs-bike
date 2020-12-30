import { AbstractEvent } from './abstract.event';

export abstract class AbstractEventSubscriber<T extends AbstractEvent> {
  public abstract handle(event: T): Promise<void>;
}
