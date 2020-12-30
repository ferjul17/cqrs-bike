import { TripAggregate } from './aggregate/trip/trip.aggregate';
import { Guid } from './guid';
import { EventBus } from './event.bus';
import {
  TripBicycleType,
  WentOutEvent,
} from './aggregate/trip/event/went.out.event';
import { AbstractEventSubscriber } from './abstract.event.subscriber';

describe('CQRS EventBus (integration)', () => {
  it('returns empty events array', () => {
    const aggregate = new TripAggregate(Guid.fromBigInt(0n));
    const eventBus = new EventBus(aggregate);
    expect(eventBus.events).toEqual([]);
  });
  it('return published events', () => {
    const aggregate = new TripAggregate(Guid.fromBigInt(0n));
    const eventBus = new EventBus(aggregate);
    const wentOutEvent = new WentOutEvent(
      1,
      new Date(),
      TripBicycleType.Road,
      1,
      1,
    );
    eventBus.publish(wentOutEvent);
    expect(eventBus.events).toEqual([wentOutEvent]);
  });
  it('return last event id', () => {
    const aggregate = new TripAggregate(Guid.fromBigInt(0n));
    const eventBus = new EventBus(aggregate);
    const wentOutEvent = new WentOutEvent(
      1,
      new Date(),
      TripBicycleType.Road,
      1,
      1,
    );
    eventBus.publish(wentOutEvent);
    expect(eventBus.lastId()).toEqual(wentOutEvent.id);
  });
  it('allows subscribers to handle published events', () => {
    const aggregate = new TripAggregate(Guid.fromBigInt(0n));
    const eventBus = new EventBus(aggregate);
    const wentOutEvent = new WentOutEvent(
      1,
      new Date(),
      TripBicycleType.Road,
      1,
      1,
    );
    const handledFn = jest.fn();
    const subscriber = new (class extends AbstractEventSubscriber<WentOutEvent> {
      async handle(event: WentOutEvent): Promise<void> {
        handledFn(event);
      }
    })();
    eventBus.subscribe(subscriber);
    eventBus.publish(wentOutEvent);
    expect(handledFn).toBeCalledWith(wentOutEvent);
  });
});
