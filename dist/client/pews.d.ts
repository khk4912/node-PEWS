import { type PEWSEvents, type TypedEventEmitter } from '../types/listener_event';
import { type Logger } from '../utils/logger';
declare const PEWS_base: new () => TypedEventEmitter<PEWSEvents>;
export declare class PEWS extends PEWS_base {
    private readonly PEWSClient;
    readonly logger: Logger;
    /**
     * PEWS Client
     *
     * @param sim 시뮬레이션 여부
     * @param eqkID 시뮬레이션에 사용할 지진 ID
     * @param startTime 시뮬레이션 시작 시각
     * @param endTime 시뮬레이션 종료 시각
     */
    constructor(sim?: boolean, eqkID?: number, startTime?: Date, endTime?: Date);
    start(): void;
    emitEvent<E extends keyof PEWSEvents>(event: E, ...args: Parameters<PEWSEvents[E]>): void;
    stop(): void;
}
export {};
