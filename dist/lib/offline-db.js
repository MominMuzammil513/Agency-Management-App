"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const dexie_1 = __importDefault(require("dexie"));
class OfflineDatabase extends dexie_1.default {
    constructor() {
        super("SalesAppDB");
        this.version(1).stores({
            pendingOrders: "++id, shopId, timestamp", // Schema
        });
    }
}
exports.db = new OfflineDatabase();
