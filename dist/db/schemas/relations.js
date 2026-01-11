"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementRelations = exports.stockRelations = exports.orderItemRelations = exports.orderRelations = exports.productRelations = exports.categoryRelations = exports.shopRelations = exports.areaRelations = exports.agencyRelations = exports.userRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const _1 = require("./");
const agencies_1 = require("./agencies");
const areas_1 = require("./areas");
const shops_1 = require("./shops");
const products_1 = require("./products");
const orders_1 = require("./orders");
const categories_1 = require("./categories");
const orderItems_1 = require("./orderItems");
const stock_1 = require("./stock");
const stockMovements_1 = require("./stockMovements");
exports.userRelations = (0, drizzle_orm_1.relations)(_1.users, ({ one }) => ({
    agency: one(agencies_1.agencies, {
        fields: [_1.users.agencyId],
        references: [agencies_1.agencies.id],
    }),
}));
exports.agencyRelations = (0, drizzle_orm_1.relations)(agencies_1.agencies, ({ one, many }) => ({
    owner: one(_1.users, {
        fields: [agencies_1.agencies.ownerId],
        references: [_1.users.id],
    }),
    staff: many(_1.users),
}));
// Area → Agency
exports.areaRelations = (0, drizzle_orm_1.relations)(areas_1.areas, ({ one, many }) => ({
    agency: one(agencies_1.agencies, {
        fields: [areas_1.areas.agencyId],
        references: [agencies_1.agencies.id],
    }),
    shops: many(shops_1.shops),
}));
// Shop → Area + Agency
exports.shopRelations = (0, drizzle_orm_1.relations)(shops_1.shops, ({ one, many }) => ({
    area: one(areas_1.areas, { fields: [shops_1.shops.areaId], references: [areas_1.areas.id] }),
    agency: one(agencies_1.agencies, {
        fields: [shops_1.shops.agencyId],
        references: [agencies_1.agencies.id],
    }),
    orders: many(orders_1.orders),
}));
// Category → Agency
exports.categoryRelations = (0, drizzle_orm_1.relations)(categories_1.categories, ({ one, many }) => ({
    agency: one(agencies_1.agencies, {
        fields: [categories_1.categories.agencyId],
        references: [agencies_1.agencies.id],
    }),
    products: many(products_1.products),
}));
// Product → Category + Agency
exports.productRelations = (0, drizzle_orm_1.relations)(products_1.products, ({ one, many }) => ({
    category: one(categories_1.categories, {
        fields: [products_1.products.categoryId],
        references: [categories_1.categories.id],
    }),
    agency: one(agencies_1.agencies, {
        fields: [products_1.products.agencyId],
        references: [agencies_1.agencies.id],
    }),
    orderItems: many(orderItems_1.orderItems),
}));
// Order → Shop + Agency + User
exports.orderRelations = (0, drizzle_orm_1.relations)(orders_1.orders, ({ one, many }) => ({
    shop: one(shops_1.shops, { fields: [orders_1.orders.shopId], references: [shops_1.shops.id] }),
    agency: one(agencies_1.agencies, {
        fields: [orders_1.orders.agencyId],
        references: [agencies_1.agencies.id],
    }),
    createdBy: one(_1.users, { fields: [orders_1.orders.createdBy], references: [_1.users.id] }),
    items: many(orderItems_1.orderItems),
}));
// OrderItem → Order + Product
exports.orderItemRelations = (0, drizzle_orm_1.relations)(orderItems_1.orderItems, ({ one }) => ({
    order: one(orders_1.orders, { fields: [orderItems_1.orderItems.orderId], references: [orders_1.orders.id] }),
    product: one(products_1.products, {
        fields: [orderItems_1.orderItems.productId],
        references: [products_1.products.id],
    }),
}));
// drizzle/relations.ts (Add Relations)
exports.stockRelations = (0, drizzle_orm_1.relations)(stock_1.stock, ({ one, many }) => ({
    product: one(products_1.products, {
        fields: [stock_1.stock.productId],
        references: [products_1.products.id],
    }),
    agency: one(agencies_1.agencies, {
        fields: [stock_1.stock.agencyId],
        references: [agencies_1.agencies.id],
    }),
    movements: many(stockMovements_1.stockMovements),
}));
exports.stockMovementRelations = (0, drizzle_orm_1.relations)(stockMovements_1.stockMovements, ({ one }) => ({
    stock: one(stock_1.stock, {
        fields: [stockMovements_1.stockMovements.stockId],
        references: [stock_1.stock.id],
    }),
}));
