import { AbstractEvent } from '../abstract.event';
import { Guid } from '../guid';
import { AbstractCommand } from '../abstract.command';
import { EventBus } from '../event.bus';

export abstract class AbstractAggregate<
  T extends AbstractEvent,
  U extends AbstractCommand
> {
  public readonly bus: EventBus<T> = new EventBus<T>(this);

  public constructor(public readonly guid: Guid) {}

  public abstract handleCommand(command: U): Promise<unknown>;

  public applyEvent(event: AbstractEvent): void {
    // do nothing by default
  }
}
