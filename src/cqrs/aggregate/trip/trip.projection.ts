import { TripAggregate } from './trip.aggregate';
import { TripBicycleType, WentOutEvent } from './event/went.out.event';
import { AbstractEventSubscriber } from '../../abstract.event.subscriber';
import { TripEvent } from './event/trip.event';

export class TripProjection extends AbstractEventSubscriber<TripEvent> {
  private _distanceByMonth = new Map<
    number,
    Map<number, Map<TripBicycleType, number>>
  >();

  private constructor() {
    super();
  }

  public static async fromAggregate(
    aggregate: TripAggregate,
  ): Promise<TripProjection> {
    const tripProjection = new TripProjection();
    aggregate.bus.subscribe(tripProjection);
    // TODO: what if an event is added to the bus during the handling of events?
    for (const event of aggregate.bus.events) {
      await tripProjection.handle(event);
    }
    return tripProjection;
  }

  public async handle(event: TripEvent): Promise<void> {
    if (event instanceof WentOutEvent) {
      return this._handleWentOutEvent(event);
    }
    throw new Error(`unexpected event type "${typeof event}" received`);
  }

  public getDistance(
    year: number,
    month: number,
    bicycleType?: TripBicycleType,
  ): number {
    if (bicycleType) {
      return this._distanceByMonth.get(year)?.get(month)?.get(bicycleType) ?? 0;
    }
    const distances = Array.from(
      this._distanceByMonth.get(year)?.get(month)?.values() ?? [],
    );
    return distances.reduce((prev, curr) => prev + curr, 0);
  }

  private _distancesOfYear(
    year: number,
  ): Map<number, Map<TripBicycleType, number>> {
    let distancesOfYear = this._distanceByMonth.get(year);
    if (!distancesOfYear) {
      distancesOfYear = new Map<number, Map<TripBicycleType, number>>();
      this._distanceByMonth.set(year, distancesOfYear);
    }
    return distancesOfYear;
  }

  private _distancesOfYearAndMonth(
    year: number,
    month: number,
  ): Map<TripBicycleType, number> {
    const distancesOfYear = this._distancesOfYear(year);
    let distancesOfMonth = distancesOfYear.get(month);
    if (!distancesOfMonth) {
      distancesOfMonth = new Map<TripBicycleType, number>();
      distancesOfYear.set(month, distancesOfMonth);
    }
    return distancesOfMonth;
  }

  private _handleWentOutEvent(event: WentOutEvent): void {
    const year = event.date.getFullYear();
    const month = event.date.getMonth();
    const distanceInKm = event.distanceInKm;
    const bicycleType = event.bicycleType;
    const distances = this._distancesOfYearAndMonth(year, month);
    distances.set(
      bicycleType,
      this.getDistance(year, month, bicycleType) + distanceInKm,
    );
  }
}
