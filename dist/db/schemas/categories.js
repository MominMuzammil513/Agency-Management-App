"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const _timestamps_1 = require("./_timestamps");
exports.categories = (0, sqlite_core_1.sqliteTable)("categories", Object.assign({ id: (0, sqlite_core_1.text)("id").primaryKey().notNull(), name: (0, sqlite_core_1.text)("name").notNull(), agencyId: (0, sqlite_core_1.text)("agency_id").notNull() }, _timestamps_1.timestamps));
