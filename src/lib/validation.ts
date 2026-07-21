import { z } from "zod";
export const pantryItemSchema = z.object({ name: z.string().trim().min(1).max(100), category: z.string().trim().min(1).max(40), quantity: z.coerce.number().positive().max(9999), unit: z.string().trim().max(20), estimated_price: z.coerce.number().min(0).max(100000).optional(), purchased_at: z.string().date().optional().or(z.literal("")), expires_at: z.string().date().optional().or(z.literal("")) });
export const receiptItemSchema = z.object({ name: z.string().trim().min(1).max(100), quantity: z.coerce.number().positive().max(9999).default(1), unit: z.string().trim().max(20).default("item"), price: z.coerce.number().min(0).max(100000).optional() });
export const receiptSchema = z.object({ store_name: z.string().trim().max(100).nullable(), total_amount: z.number().min(0).max(100000).nullable(), items: z.array(receiptItemSchema).min(1).max(100) });
export const receiptCommitSchema = receiptSchema.extend({ image_path: z.string().max(500).optional() });
export const pantrySummarySchema = z.object({
  expiring_soon: z.array(z.object({ name: z.string(), expires_at: z.string().nullable(), note: z.string() })).max(10),
  low_stock_staples: z.array(z.string()).max(10),
  total_estimated_value: z.number().min(0),
  headline: z.string().max(160),
  quick_meals: z.array(z.object({
    title: z.string().min(1).max(100),
    time_minutes: z.number().int().min(5).max(30),
    description: z.string().min(1).max(220),
    use_from_pantry: z.array(z.string().min(1).max(80)).min(1).max(8),
    buy_to_complete: z.array(z.object({ name: z.string().min(1).max(80), reason: z.string().min(1).max(120) })).max(4),
  })).min(1).max(3),
});
export const recipeOptionsSchema = z.object({ recipes: z.array(z.object({ title: z.string().max(120), time_minutes: z.number().int().positive().max(180), estimated_cost: z.number().min(0), ingredients: z.array(z.object({ name: z.string(), amount: z.string(), have: z.boolean() })).max(30), steps: z.array(z.string()).min(1).max(12), missing_ingredients: z.array(z.string()).max(20) })).min(1).max(3) });
export const recipeRequestSchema = z.object({ minutes: z.coerce.number().int().min(10).max(120), vegetarian: z.boolean().optional(), cuisine: z.string().trim().max(60).optional(), prioritize_expiring: z.boolean().optional() });
