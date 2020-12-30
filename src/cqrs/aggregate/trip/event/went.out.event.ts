import { TripEvent } from './trip.event';

export const enum TripBicycleType {
  MT = 'MT',
  Road = 'Road',
  HT = 'HT',
}

export class WentOutEvent extends TripEvent {
  public constructor(
    id: number,
    public readonly date: Date,
    public readonly bicycleType: TripBicycleType,
    public readonly distanceInKm: number,
    public readonly durationInMinutes: number,
  ) {
    super(id);
  }
}
