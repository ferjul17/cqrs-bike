import { AbstractAggregate } from '../abstract.aggregate';
import { BicycleEvent } from './event/bicycle.event';

export class BicycleAggregate extends AbstractAggregate<BicycleEvent> {}
