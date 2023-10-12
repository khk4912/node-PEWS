import { type PEWSEvents, type TypedEventEmitter } from '../types/listener_event';
import { type Logger } from '../utils/logger';
declare const PEWS_base: new () => TypedEventEmitter<PEWSEvents>;
export declare class PEWS extends PEWS_base {
    private readonly PEWSClient;
    readonly logger: Logger;
    constructor(sim?: boolean, eqkID?: number, startTime?: Date, endTime?: Date);
    start(): void;
    emitEvent<E extends keyof PEWSEvents>(event: E, ...args: Parameters<PEWSEvents[E]>): void;
    stop(): void;
}
export {};
