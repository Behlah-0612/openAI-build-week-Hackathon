import { z } from "zod";
export const pantryItemSchema = z.object({ name: z.string().trim().min(1).max(100), category: z.string().trim().min(1).max(40), quantity: z.coerce.number().positive().max(9999), unit: z.string().trim().max(20), estimated_price: z.coerce.number().min(0).max(100000).optional(), expires_at: z.string().date().optional().or(z.literal("")) });
export const receiptItemSchema = z.object({ name: z.string().trim().min(1).max(100), quantity: z.coerce.number().positive().max(9999).default(1), unit: z.string().trim().max(20).default("item"), price: z.coerce.number().min(0).max(100000).optional() });
export const receiptSchema = z.object({ store_name: z.string().trim().max(100).nullable(), total_amount: z.number().min(0).max(100000).nullable(), items: z.array(receiptItemSchema).min(1).max(100) });
export const receiptCommitSchema = receiptSchema.extend({ image_path: z.string().max(500).optional() });
