// src/lib/zod/orders.ts
import { z } from "zod";

export const OrderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(), // snapshot price
});

export const CreateOrderSchema = z.object({
  shopId: z.string().min(1),
  agencyId: z.string().min(1),
  createdBy: z.string().min(1), // user id
  items: z.array(OrderItemInputSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
