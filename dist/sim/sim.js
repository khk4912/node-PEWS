"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationPEWS = void 0;
const client_1 = require("../client/client");
const constant_1 = require("../model/constant");
class SimulationPEWS extends client_1.PEWSClient {
    constructor(wrapper, eqkID, startTime, endTime) {
        super(wrapper);
        this.HEADER_LEN = 1;
        this.eqkID = eqkID;
        this.currentTime = new Date(startTime.getTime() - constant_1.TZ_MSEC);
        this.endTime = new Date(endTime.getTime() - constant_1.TZ_MSEC);
    }
    getTimeString() {
        const pad2 = (n) => {
            return n < 10 ? `0${n}` : `${n}`;
        };
        return `${this.currentTime.getFullYear()}${pad2(this.currentTime.getMonth() + 1)}${pad2(this.currentTime.getDate())}${pad2(this.currentTime.getHours())}${pad2(this.currentTime.getMinutes())}${pad2(this.currentTime.getSeconds())}`;
    }
    increaseTime() {
        this.currentTime = new Date(this.currentTime.getTime() + 1000);
        if (this.currentTime.getTime() > this.endTime.getTime()) {
            this.stop();
        }
    }
    startIncreaseTimeInterval() {
        this.increaseTimeIntervalID = setInterval(() => {
            this.increaseTime();
        }, 1000);
    }
    loop() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (this.stopLoop) {
                    break;
                }
                yield this.getMMI(`${this.eqkID}/${this.getTimeString()}`);
                this.phaseHandler();
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.startIncreaseTimeInterval();
            yield this.getSta(`${this.eqkID}/${this.getTimeString()}`);
            yield this.getMMI(`${this.eqkID}/${this.getTimeString()}`);
            yield this.loop();
        });
    }
    stop() {
        this.stopLoop = true;
        if (this.increaseTimeIntervalID !== undefined) {
            clearInterval(this.increaseTimeIntervalID);
        }
    }
}
exports.SimulationPEWS = SimulationPEWS;
