import { GoOutCommand } from './command/go.out.command';
import { TripBicycleType } from './event/went.out.event';
import { TripAggregate } from './trip.aggregate';
import { Guid } from '../../guid';
import { TripProjection } from './trip.projection';
import { TripEvent } from './event/trip.event';

describe('CQRS TripProjection (integration)', () => {
  let tripAggregate: TripAggregate;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const goOutRoad = new GoOutCommand(TripBicycleType.Road, 20, 30, date);
  const goOutMT = new GoOutCommand(TripBicycleType.MT, 10, 60, date);
  const goOutHT = new GoOutCommand(TripBicycleType.HT, 30, 45, date);

  function getDistanceForProjection(tripProjection: TripProjection) {
    return function getDistance(bicycleType?: TripBicycleType) {
      return tripProjection.getDistance(year, month, bicycleType);
    };
  }

  beforeEach(() => {
    tripAggregate = new TripAggregate(Guid.fromBigInt(0n));
  });

  it('sums correctly the distance', async () => {
    const tripProjection = await tripAggregate.tripProjection();
    const getDistance = getDistanceForProjection(tripProjection);

    expect(getDistance()).toEqual(0);
    await tripAggregate.handleCommand(goOutRoad);
    expect(getDistance()).toEqual(goOutRoad.distanceInKm);
    await tripAggregate.handleCommand(goOutMT);
    expect(getDistance()).toEqual(
      goOutRoad.distanceInKm + goOutMT.distanceInKm,
    );
    await tripAggregate.handleCommand(goOutHT);
    expect(getDistance()).toEqual(
      goOutRoad.distanceInKm + goOutMT.distanceInKm + goOutHT.distanceInKm,
    );
    expect(getDistance(TripBicycleType.Road)).toEqual(goOutRoad.distanceInKm);
    expect(getDistance(TripBicycleType.MT)).toEqual(goOutMT.distanceInKm);
    expect(getDistance(TripBicycleType.HT)).toEqual(goOutHT.distanceInKm);
  });

  it('handles every events', async () => {
    await tripAggregate.handleCommand(goOutRoad);
    await tripAggregate.handleCommand(goOutMT);
    const tripProjection = await tripAggregate.tripProjection();
    const getDistance = getDistanceForProjection(tripProjection);

    await tripAggregate.handleCommand(goOutHT);
    expect(getDistance()).toEqual(
      goOutRoad.distanceInKm + goOutMT.distanceInKm + goOutHT.distanceInKm,
    );
  });

  it('rejects unexpected events', async () => {
    const tripProjection = await tripAggregate.tripProjection();
    const eventError = new (class extends TripEvent {})(1);
    const msg = `unexpected event type "${typeof eventError}" received`;
    await expect(() => tripProjection.handle(eventError)).rejects.toThrow(msg);
  });
});
