import { AbstractEvent } from './abstract.event';
import { AbstractEventSubscriber } from './abstract.event.subscriber';
import { AbstractAggregate } from './aggregate/abstract.aggregate';
import { AbstractCommand } from './abstract.command';

export class EventBus<T extends AbstractEvent> {
  private _events = new Array<T>();
  private _subscribers = new Set<AbstractEventSubscriber<T>>();

  public constructor(
    public readonly aggregate: AbstractAggregate<T, AbstractCommand>,
  ) {}

  public get events(): readonly T[] {
    return this._events;
  }

  public async publish(event: T): Promise<void> {
    if (this._events.length) {
      const lastEvent = this._events[this._events.length - 1];
      if (lastEvent.id >= event.id) {
        const msg = `event id ${event.id} is <= to last event id (${lastEvent.id}) of the aggregate ${this.aggregate.guid}`;
        throw new RangeError(msg);
      }
    }

    this._events.push(event);

    for (const subscriber of this._subscribers) {
      await subscriber.handle(event);
    }
  }

  public subscribe(subscriber: AbstractEventSubscriber<T>) {
    this._subscribers.add(subscriber);
  }

  public lastId(): T['id'] | undefined {
    return this._events[this._events.length - 1]?.id;
  }
}
