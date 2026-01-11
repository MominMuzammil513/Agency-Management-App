"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shops = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.shops = (0, sqlite_core_1.sqliteTable)("shops", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), name: (0, sqlite_core_1.text)("name").notNull(), areaId: (0, sqlite_core_1.text)("area_id").notNull(), agencyId: (0, sqlite_core_1.text)("agency_id").notNull(), ownerName: (0, sqlite_core_1.text)("owner_name"), mobile: (0, sqlite_core_1.text)("mobile") }, _timestamps_1.timestamps));
