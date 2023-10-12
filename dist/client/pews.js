"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PEWS = void 0;
const sim_1 = require("../sim/sim");
const client_1 = require("./client");
const events_1 = __importDefault(require("events"));
class PEWS extends events_1.default {
    /**
     * PEWS Client
     *
     * @param sim 시뮬레이션 여부
     * @param eqkID 시뮬레이션에 사용할 지진 ID
     * @param startTime 시뮬레이션 시작 시각
     * @param endTime 시뮬레이션 종료 시각
     */
    constructor(sim = false, eqkID, startTime, endTime) {
        // FIXME: need to remove this eslint-igonre in future
        // eslint-disable-next-line constructor-super
        super();
        if (sim) {
            if (eqkID === undefined || startTime === undefined || endTime === undefined) {
                throw new Error('eqkID, startTime, endTime must be given when sim is true!');
            }
            this.PEWSClient = new sim_1.SimulationPEWS(this, eqkID, startTime, endTime);
        }
        else {
            this.PEWSClient = new client_1.PEWSClient(this);
        }
        this.logger = this.PEWSClient.logger;
    }
    start() {
        void this.PEWSClient.run();
    }
    emitEvent(event, ...args) {
        // console.log(event, args)
        this.emit(event, ...args);
    }
    stop() {
        this.PEWSClient.stop();
    }
}
exports.PEWS = PEWS;
