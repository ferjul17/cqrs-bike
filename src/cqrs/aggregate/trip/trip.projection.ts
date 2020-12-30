import { TripAggregate } from './trip.aggregate';
import { WentOutEvent } from './event/went.out.event';
import { AbstractEventSubscriber } from '../../abstract.event.subscriber';
import { TripEvent } from './event/trip.event';

export class TripProjection extends AbstractEventSubscriber<TripEvent> {
  private _distanceByMonth = new Map<number, Map<number, number>>();

  private constructor() {
    super();
  }

  public static async fromAggregate(
    aggregate: TripAggregate,
  ): Promise<TripProjection> {
    const tripProjection = new TripProjection();
    aggregate.bus.subscribe(tripProjection);
    for (const event of aggregate.bus.events) {
      await tripProjection.handle(event);
    }
    return tripProjection;
  }

  public async handle(event: TripEvent): Promise<void> {
    if (event instanceof WentOutEvent) {
      this._handleWentOutEvent(event);
    }
  }

  public getDistance(year: number, month: number): number {
    return this._distanceByMonth.get(year)?.get(month) ?? 0;
  }

  private _distancesOfYear(year: number): Map<number, number> {
    let distancesOfYear = this._distanceByMonth.get(year);
    if (!distancesOfYear) {
      distancesOfYear = new Map<number, number>();
      this._distanceByMonth.set(year, distancesOfYear);
    }
    return distancesOfYear;
  }

  private _handleWentOutEvent(event: WentOutEvent): void {
    const year = event.date.getFullYear();
    const month = event.date.getMonth();
    const distanceInKm = event.distanceInKm;
    const distancesOfYear = this._distancesOfYear(year);

    distancesOfYear.set(month, this.getDistance(year, month) + distanceInKm);
  }
}
