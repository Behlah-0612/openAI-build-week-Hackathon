import OpenAI from "openai";
export const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6";
export const RECEIPT_SCHEMA = { name: "receipt_parse", strict: true, schema: { type: "object", additionalProperties: false, properties: { store_name: { type: ["string", "null"] }, total_amount: { type: ["number", "null"] }, items: { type: "array", items: { type: "object", additionalProperties: false, properties: { name: { type: "string" }, quantity: { type: "number" }, unit: { type: "string" }, price: { type: ["number", "null"] } }, required: ["name", "quantity", "unit", "price"] } } }, required: ["store_name", "total_amount", "items"] } } as const;
