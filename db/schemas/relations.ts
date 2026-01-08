import { relations } from "drizzle-orm";
import { users } from "./";
import { agencies } from "./agencies";
import { areas } from "./areas";
import { shops } from "./shops";
import { products } from "./products";
import { orders } from "./orders";
import { categories } from "./categories";
import { orderItems } from "./orderItems";
import { stock } from "./stock";
import { stockMovements } from "./stockMovements";

export const userRelations = relations(users, ({ one }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
}));

export const agencyRelations = relations(agencies, ({ one, many }) => ({
  owner: one(users, {
    fields: [agencies.ownerId],
    references: [users.id],
  }),
  staff: many(users),
}));

// Area → Agency
export const areaRelations = relations(areas, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [areas.agencyId],
    references: [agencies.id],
  }),
  shops: many(shops),
}));

// Shop → Area + Agency
export const shopRelations = relations(shops, ({ one, many }) => ({
  area: one(areas, { fields: [shops.areaId], references: [areas.id] }),
  agency: one(agencies, {
    fields: [shops.agencyId],
    references: [agencies.id],
  }),
  orders: many(orders),
}));

// Category → Agency
export const categoryRelations = relations(categories, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [categories.agencyId],
    references: [agencies.id],
  }),
  products: many(products),
}));

// Product → Category + Agency
export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  agency: one(agencies, {
    fields: [products.agencyId],
    references: [agencies.id],
  }),
  orderItems: many(orderItems),
}));

// Order → Shop + Agency + User
export const orderRelations = relations(orders, ({ one, many }) => ({
  shop: one(shops, { fields: [orders.shopId], references: [shops.id] }),
  agency: one(agencies, {
    fields: [orders.agencyId],
    references: [agencies.id],
  }),
  createdBy: one(users, { fields: [orders.createdBy], references: [users.id] }),
  items: many(orderItems),
}));

// OrderItem → Order + Product
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// drizzle/relations.ts (Add Relations)
export const stockRelations = relations(stock, ({ one, many }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
  agency: one(agencies, {
    fields: [stock.agencyId],
    references: [agencies.id],
  }),
  movements: many(stockMovements),
}));

export const stockMovementRelations = relations(stockMovements, ({ one }) => ({
  stock: one(stock, {
    fields: [stockMovements.stockId],
    references: [stock.id],
  }),
}));