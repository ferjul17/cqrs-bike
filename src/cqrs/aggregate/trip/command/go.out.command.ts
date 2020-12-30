import { TripCommand } from './trip.command';

export class GoOutCommand extends TripCommand {
  public constructor(
    public readonly bicycleType: string,
    public readonly distanceInKm: number,
    public readonly durationInMinutes: number,
    public readonly date: Date,
  ) {
    super();
  }
}
