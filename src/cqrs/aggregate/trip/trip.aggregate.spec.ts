import { TripAggregate } from './trip.aggregate';
import { Guid } from '../../guid';
import { GoOutCommand } from './command/go.out.command';
import { TripBicycleType } from './event/went.out.event';
import { TripCommand } from './command/trip.command';

describe('CQRS TripAggregate (integration)', () => {
  let tripAggregate: TripAggregate;
  const date = new Date();

  beforeEach(() => {
    tripAggregate = new TripAggregate(Guid.fromBigInt(0n));
  });

  it('handles GoOutCommand', async () => {
    const goOutRoad = new GoOutCommand(TripBicycleType.Road, 20, 30, date);
    const goOutErrorType = new GoOutCommand('Unexpected', 30, 45, date);
    const goOutErrorDist = new GoOutCommand(TripBicycleType.Road, -1, 45, date);
    const goOutErrorTime = new GoOutCommand(TripBicycleType.Road, 30, -1, date);

    expect(tripAggregate.bus.events.length).toEqual(0);
    await tripAggregate.handleCommand(goOutRoad);
    expect(tripAggregate.bus.events.length).toEqual(1);

    await expect(() =>
      tripAggregate.handleCommand(goOutErrorType),
    ).rejects.toThrow(`invalid bicycle type "${goOutErrorType.bicycleType}"`);
    await expect(() =>
      tripAggregate.handleCommand(goOutErrorDist),
    ).rejects.toThrow(
      `distanceInKm (${goOutErrorDist.distanceInKm}) cannot be <= 0`,
    );
    await expect(() =>
      tripAggregate.handleCommand(goOutErrorTime),
    ).rejects.toThrow(
      `durationInMinutes (${goOutErrorTime.durationInMinutes}) cannot be <= 0`,
    );
    expect(tripAggregate.bus.events.length).toEqual(1);
  });

  it('builds projection only once', async () => {
    const [tripProjection1, tripProjection2] = await Promise.all([
      tripAggregate.tripProjection(),
      tripAggregate.tripProjection(),
    ]);
    const tripProjection3 = await tripAggregate.tripProjection();
    expect(tripProjection1).toBe(tripProjection2);
    expect(tripProjection1).toBe(tripProjection3);
  });

  it('rejects expected commands', async () => {
    const unexpectedCommand = new (class extends TripCommand {})();
    const msg = `unexpected command type "${typeof unexpectedCommand}" received`;
    await expect(
      tripAggregate.handleCommand(unexpectedCommand),
    ).rejects.toThrow(msg);
  });
});
