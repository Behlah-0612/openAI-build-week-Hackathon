"use client";

import { type ChangeEvent, useState } from "react";
import { Camera, FileUp, LoaderCircle, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";

type ReceiptItem = {
  name: string;
  quantity: number;
  unit: string;
  price?: number | null;
};

type Receipt = {
  store_name: string | null;
  total_amount: number | null;
  items: ReceiptItem[];
};

const MAX_SOURCE_FILE_SIZE = 25 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 8 * 1024 * 1024;

async function imageElementSource(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("This phone could not read that receipt image. Take a new photo using your camera, then try again."));
      image.src = objectUrl;
    });
    return { image, dispose: () => URL.revokeObjectURL(objectUrl) };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

async function strippedImage(file: File) {
  const maxDimension = 2400;
  let source: CanvasImageSource;
  let width: number;
  let height: number;
  let dispose = () => {};

  // createImageBitmap is fast, but it is unavailable in some mobile Safari
  // versions. The Image fallback keeps camera capture working there while the
  // canvas re-encode still removes the original image's EXIF metadata.
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file);
      source = bitmap;
      width = bitmap.width;
      height = bitmap.height;
      dispose = () => bitmap.close();
    } catch {
      // Some mobile browsers expose createImageBitmap but cannot decode a
      // camera image with it. Fall through to the universally supported Image
      // path instead of showing a technical browser error.
      const fallback = await imageElementSource(file);
      source = fallback.image;
      width = fallback.image.naturalWidth;
      height = fallback.image.naturalHeight;
      dispose = fallback.dispose;
    }
  } else {
    const fallback = await imageElementSource(file);
    source = fallback.image;
    width = fallback.image.naturalWidth;
    height = fallback.image.naturalHeight;
    dispose = fallback.dispose;
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    dispose();
    throw new Error("Your browser could not prepare the image for a secure upload.");
  }

  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  dispose();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Your browser could not prepare the receipt image.");

  return new File([blob], "receipt.jpg", { type: "image/jpeg" });
}

async function responseData(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<{ error?: string; receipt?: Receipt; image_path?: string }>;

  if (response.status === 401) return { error: "Your session has expired. Please log in again, then scan the receipt." };
  if (response.status === 403) return { error: "This phone could not submit the receipt securely. Reload PantryChef from the same Wi-Fi connection and try again." };
  if (response.status >= 500) return { error: "Receipt scanning is temporarily unavailable. Please try again in a moment or add the items manually." };
  return { error: "We could not process that receipt image. Try a brighter, closer photo of the full receipt." };
}

type StatusMessage = { text: string; tone: "success" | "error" } | null;

export function ReceiptScanner() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [imagePath, setImagePath] = useState("");
  const [status, setStatus] = useState<"idle" | "preparing" | "processing" | "saving">("idle");
  const [message, setMessage] = useState<StatusMessage>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const router = useRouter();
  const busy = status !== "idle";

  async function scan(file: File) {
    setMessage(null);
    setReceipt(null);
    setImagePath("");

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Choose an image of your receipt, not a document or video.", tone: "error" });
      return;
    }

    if (file.size > MAX_SOURCE_FILE_SIZE) {
      setMessage({ text: "That photo is too large to process on this phone. Take a new photo with a little less resolution, then try again.", tone: "error" });
      return;
    }

    try {
      setSelectedFileName(file.name || "Receipt photo");
      setStatus("preparing");
      const safeImage = await strippedImage(file);
      if (safeImage.size > MAX_UPLOAD_FILE_SIZE) {
        setMessage({ text: "That receipt photo is still too large after preparation. Take a closer photo of the receipt and try again.", tone: "error" });
        return;
      }
      const form = new FormData();
      form.append("receipt", safeImage);

      setStatus("processing");
      const response = await fetch("/api/receipts/parse", { method: "POST", body: form });
      const data = await responseData(response);

      if (!response.ok || !data.receipt || !data.image_path) {
        setMessage({ text: data.error ?? "The receipt could not be processed. Please try another image.", tone: "error" });
        return;
      }

      setReceipt(data.receipt);
      setImagePath(data.image_path);
      setMessage({ text: `Found ${data.receipt.items.length} item${data.receipt.items.length === 1 ? "" : "s"}. Review them before saving.`, tone: "success" });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "The receipt image could not be processed.", tone: "error" });
    } finally {
      setStatus("idle");
    }
  }

  async function commit() {
    if (!receipt || receipt.items.length === 0) {
      setMessage({ text: "Add at least one receipt item before saving.", tone: "error" });
      return;
    }

    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch("/api/receipts/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...receipt, image_path: imagePath }),
      });
      const data = await responseData(response);

      if (!response.ok) {
        setMessage({ text: data.error ?? "The reviewed items could not be added to your pantry.", tone: "error" });
        return;
      }

      router.push("/pantry?inventory_notice=Receipt%20items%20were%20added%20to%20your%20inventory.");
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "The reviewed items could not be saved.", tone: "error" });
    } finally {
      setStatus("idle");
    }
  }

  function updateItem(index: number, patch: Partial<ReceiptItem>) {
    if (!receipt) return;
    const items = [...receipt.items];
    items[index] = { ...items[index], ...patch };
    setReceipt({ ...receipt, items });
  }

  function removeItem(index: number) {
    if (!receipt) return;
    setReceipt({ ...receipt, items: receipt.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  function reset() {
    setReceipt(null);
    setImagePath("");
    setMessage(null);
    setSelectedFileName("");
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (file && !busy) void scan(file);
  }

  return (
    <section className="mt-7">
      {!receipt ? (
        <Card variant="dashed" padding="lg" className="text-center">
          <ReceiptText className="mx-auto text-primary" size={32} aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-text">Add a receipt photo</h2>
          <p className="mt-1 text-sm text-muted-text">JPEG, PNG, or WebP · up to 8 MB. Nothing is added until you review it.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label
              aria-disabled={busy}
              className={cn(buttonVariants({ size: "lg", className: "cursor-pointer gap-2" }), busy && "pointer-events-none cursor-wait opacity-70")}
            >
              <Camera size={20} aria-hidden="true" /> Capture receipt
              <input
                aria-label="Capture receipt photo"
                className="sr-only"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={chooseFile}
              />
            </label>
            <label
              aria-disabled={busy}
              className={cn(buttonVariants({ variant: "outline", size: "lg", className: "cursor-pointer gap-2" }), busy && "pointer-events-none cursor-wait opacity-70")}
            >
              <FileUp size={20} aria-hidden="true" /> Upload receipt
              <input aria-label="Upload receipt image" className="sr-only" type="file" accept="image/*" onChange={chooseFile} />
            </label>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Review before saving</p>
              <h2 className="mt-1 text-xl font-bold text-text">Check scanned items</h2>
              <p className="mt-1 text-sm text-muted-text">Edit, remove, or add any item below. Nothing has been saved yet.</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={busy}>
              Start over
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Store name" htmlFor="receipt-store" optional>
              <Input
                id="receipt-store"
                value={receipt.store_name ?? ""}
                onChange={(event) => setReceipt({ ...receipt, store_name: event.target.value || null })}
                placeholder="Store name"
              />
            </Field>
            <Field label="Receipt total" htmlFor="receipt-total" optional>
              <Input
                id="receipt-total"
                value={receipt.total_amount ?? ""}
                onChange={(event) => setReceipt({ ...receipt, total_amount: event.target.value === "" ? null : Number(event.target.value) })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-3">
            {receipt.items.map((item, index) => (
              <Card variant="outlined" padding="sm" key={`${item.name}-${index}`}>
                <div className="grid gap-2 sm:grid-cols-[1fr_72px_88px_80px_auto]">
                  <Field label="Item" htmlFor={`receipt-item-${index}-name`}>
                    <Input id={`receipt-item-${index}-name`} value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} />
                  </Field>
                  <Field label="Qty" htmlFor={`receipt-item-${index}-qty`}>
                    <Input
                      id={`receipt-item-${index}-qty`}
                      value={item.quantity}
                      type="number"
                      min="0.1"
                      step="0.1"
                      onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                    />
                  </Field>
                  <Field label="Unit" htmlFor={`receipt-item-${index}-unit`}>
                    <Input id={`receipt-item-${index}-unit`} value={item.unit} onChange={(event) => updateItem(index, { unit: event.target.value })} />
                  </Field>
                  <Field label="Price" htmlFor={`receipt-item-${index}-price`}>
                    <Input
                      id={`receipt-item-${index}-price`}
                      value={item.price ?? ""}
                      type="number"
                      min="0"
                      step="0.01"
                      onChange={(event) => updateItem(index, { price: event.target.value === "" ? null : Number(event.target.value) })}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="self-end text-muted-text hover:bg-error-surface hover:text-error"
                    aria-label={`Remove ${item.name || "receipt item"}`}
                    title="Remove item"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReceipt({ ...receipt, items: [...receipt.items, { name: "", quantity: 1, unit: "item", price: null }] })}
            disabled={busy}
            className="mt-3 gap-2"
          >
            <Plus size={18} aria-hidden="true" /> Add another item
          </Button>

          <Button type="button" size="lg" disabled={receipt.items.length === 0} loading={status === "saving"} onClick={() => void commit()} className="mt-4 w-full">
            {status === "saving" ? "Adding items to pantry…" : `Confirm & add ${receipt.items.length} item${receipt.items.length === 1 ? "" : "s"}`}
          </Button>
        </Card>
      )}

      {(busy || message) && (
        <div aria-live="polite" className="mt-4">
          {busy ? (
            <p role="status" className="flex items-center justify-center gap-2 rounded-lg bg-surface p-3 text-center text-sm text-muted-text shadow-sm shadow-black/5">
              <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
              {status === "preparing" ? "Preparing receipt image…" : status === "processing" ? "Processing receipt with PantryChef AI…" : "Saving reviewed items to your pantry…"}
            </p>
          ) : (
            message && <Alert variant={message.tone}>{message.text}</Alert>
          )}
        </div>
      )}
      {selectedFileName && !receipt && !busy && <p className="mt-3 text-center text-xs text-muted-text">Last selected: {selectedFileName}</p>}
    </section>
  );
}
