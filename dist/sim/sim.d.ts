import { PEWSClient } from '../client/client';
import { type PEWS } from '../client/pews';
export declare class SimulationPEWS extends PEWSClient {
    protected HEADER_LEN: number;
    private readonly eqkID;
    private currentTime;
    private readonly endTime;
    private increaseTimeIntervalID?;
    constructor(wrapper: PEWS, eqkID: number, startTime: Date, endTime: Date);
    protected getTimeString(): string;
    private increaseTime;
    private startIncreaseTimeInterval;
    loop(): Promise<void>;
    run(): Promise<void>;
    stop(): void;
}
