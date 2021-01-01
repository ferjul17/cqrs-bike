import { AbstractAggregate } from '../abstract.aggregate';
import { Guid } from '../../guid';
import { TripEvent } from './event/trip.event';
import { TripProjection } from './trip.projection';
import { TripCommand } from './command/trip.command';
import { GoOutCommand } from './command/go.out.command';
import { TripBicycleType, WentOutEvent } from './event/went.out.event';

export class TripAggregate extends AbstractAggregate<TripEvent, TripCommand> {
  public constructor(guid: Guid) {
    super(guid);
  }

  private _tripProjectionPromise: Promise<TripProjection> | undefined;
  public tripProjection(): Promise<TripProjection> {
    if (!this._tripProjectionPromise) {
      this._tripProjectionPromise = TripProjection.fromAggregate(this);
    }
    return this._tripProjectionPromise;
  }

  public async handleCommand(command: TripCommand): Promise<unknown> {
    if (command instanceof GoOutCommand) {
      return this._handleGoOutCommand(command);
    }
    throw new Error(`unexpected command type "${typeof command}" received`);
  }

  private async _handleGoOutCommand(command: GoOutCommand): Promise<true> {
    const eventId = (this.bus.lastId() ?? 0) + 1;

    let bicycleType: TripBicycleType;
    switch (command.bicycleType) {
      case TripBicycleType.MT:
      case TripBicycleType.HT:
      case TripBicycleType.Road:
        bicycleType = command.bicycleType;
        break;
      default:
        throw new Error(`invalid bicycle type "${command.bicycleType}"`);
    }

    const durationInMinutes = command.durationInMinutes;
    if (durationInMinutes <= 0) {
      throw new RangeError(
        `durationInMinutes (${durationInMinutes}) cannot be <= 0`,
      );
    }

    const distanceInKm = command.distanceInKm;
    if (distanceInKm <= 0) {
      throw new RangeError(`distanceInKm (${distanceInKm}) cannot be <= 0`);
    }

    const wentOuEvent = new WentOutEvent(
      eventId,
      command.date,
      bicycleType,
      distanceInKm,
      durationInMinutes,
    );

    await this.bus.publish(wentOuEvent);

    return true;
  }
}
