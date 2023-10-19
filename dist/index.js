"use strict";
// import { event } from './client/event_deco'
// import { PEWS } from './client/pews'
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPError = exports.Logger = exports.LoggingLevel = exports.SimulationData = exports.PEWS = exports.default = void 0;
var pews_1 = require("./client/pews");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return pews_1.PEWS; } });
var pews_2 = require("./client/pews");
Object.defineProperty(exports, "PEWS", { enumerable: true, get: function () { return pews_2.PEWS; } });
var sim_data_1 = require("./sim/sim_data");
Object.defineProperty(exports, "SimulationData", { enumerable: true, get: function () { return sim_data_1.SimulationData; } });
var logger_1 = require("./utils/logger");
Object.defineProperty(exports, "LoggingLevel", { enumerable: true, get: function () { return logger_1.LoggingLevel; } });
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
var error_1 = require("./utils/error");
Object.defineProperty(exports, "HTTPError", { enumerable: true, get: function () { return error_1.HTTPError; } });
// class TEST extends PEWS {
//   @event('loop')
//   newEEW (data: any): void {
//     console.log('asdf')
//   }
// }
// const test = new TEST()
// test.start()
