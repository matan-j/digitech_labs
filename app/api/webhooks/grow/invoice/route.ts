// ============================================================
// app/api/webhooks/grow/invoice/route.ts
// Inbound webhook for the GROW/Meshulam RECEIPT (חשבונית). ALL issued invoices
// are POSTed here. The buyer's public order id is echoed back as a query param
// (our DGH-… id) and we attach the receipt to that existing order. Example:
//
//   POST /api/webhooks/grow/invoice?publicOrderId=DGH-8310CD9F8C95
//   {
//     "invoiceNumber": "20",                              // receipt number
//     "invoiceUrl":    "https://secure.meshulam.co.il/..." // the receipt link
//   }
//
// Matching is by the PUBLIC ORDER ID (query or body), not by transaction code.
// `invoiceUrl` becomes the order's invoice link (download via
// /api/account/orders/<id>/invoice).
//
// SECURITY: same optional shared secret as the payment webhook
// (GROW_WEBHOOK_SECRET). Idempotent — re-delivery just re-attaches the same
// receipt. We never grant access here; that only happens on payment-success.
// ============================================================

import { NextResponse } from 'next/server';
import { getOrderByPublicId, setOrderInvoice } from '@/lib/payments/order-service';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** First present value among keys, searched case-insensitively + nested. */
function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  const lower = new Map<string, unknown>();
  const walk = (o: unknown, depth: number) => {
    if (!o || typeof o !== 'object' || depth > 4) return;
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (v != null && typeof v !== 'object') {
        const lk = k.toLowerCase();
        if (!lower.has(lk)) lower.set(lk, v);
      }
      if (v && typeof v === 'object') walk(v, depth + 1);
    }
  };
  walk(obj, 0);
  for (const key of keys) {
    const v = lower.get(key.toLowerCase());
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

async function parsePayload(request: Request, url: URL): Promise<Record<string, unknown>> {
  const raw = await request.text().catch(() => '');
  let body: Record<string, unknown> = {};
  if (raw) {
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      try {
        body = Object.fromEntries(new URLSearchParams(raw));
      } catch {
        body = { _raw: raw };
      }
    }
  }
  return { ...body, ...Object.fromEntries(url.searchParams) };
}

function secretOk(request: Request, payload: Record<string, unknown>): boolean {
  const expected = process.env.GROW_WEBHOOK_SECRET;
  if (!expected) {
    console.warn('[grow:invoice] GROW_WEBHOOK_SECRET not set — accepting webhook unauthenticated. Set it in production.');
    return true;
  }
  const provided =
    request.headers.get('x-webhook-secret') ??
    request.headers.get('x-grow-secret') ??
    pick(payload, ['secret', 'webhook_secret', 'token']);
  return provided === expected;
}

async function logEvent(params: {
  orderId: string | null;
  eventId: string;
  status: 'processed' | 'error' | 'ignored';
  raw: unknown;
  error?: string | null;
}) {
  const supabase = createServiceClient();
  await supabase.from('payment_events').upsert(
    {
      order_id: params.orderId,
      provider: 'grow',
      provider_event_id: params.eventId,
      event_type: 'invoice',
      raw_payload: (params.raw ?? {}) as Record<string, unknown>,
      processing_status: params.status,
      processing_error: params.error ?? null,
      processed_at: new Date().toISOString(),
    },
    { onConflict: 'provider,provider_event_id', ignoreDuplicates: true },
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const payload = await parsePayload(request, url);
  console.info('[grow:invoice] received', JSON.stringify(payload).slice(0, 2000));

  if (!secretOk(request, payload)) {
    console.error('[grow:invoice] rejected: bad/missing secret');
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Our public order id (DGH-…), echoed back as ?publicOrderId=… (or in the body).
  const publicOrderId = pick(payload, [
    'publicOrderId', 'public_order_id', 'order_number', 'order', 'order_id', 'orderid',
  ]);
  const invoiceNumber = pick(payload, ['invoiceNumber', 'invoice_number', 'documentNumber', 'document_number']);
  const invoiceUrl = pick(payload, ['invoiceUrl', 'invoice_url', 'documentUrl', 'document_url', 'url', 'pdf', 'pdfUrl']);

  if (!publicOrderId) {
    await logEvent({ orderId: null, eventId: `grow-invoice-no-id-${Math.abs(hashStr(JSON.stringify(payload)))}`, status: 'error', raw: payload, error: 'missing publicOrderId' });
    console.error('[grow:invoice] missing publicOrderId');
    return NextResponse.json({ error: 'missing_public_order_id' }, { status: 400 });
  }
  if (!invoiceUrl) {
    await logEvent({ orderId: null, eventId: `grow-invoice-${publicOrderId}`, status: 'error', raw: payload, error: 'missing invoiceUrl' });
    console.error('[grow:invoice] missing invoiceUrl', { publicOrderId });
    return NextResponse.json({ error: 'missing_invoice_url' }, { status: 400 });
  }

  const eventId = `grow-invoice-${publicOrderId}`;

  // Match the existing order by its public order id.
  const order = await getOrderByPublicId(publicOrderId);
  if (!order) {
    await logEvent({ orderId: null, eventId: `${eventId}-unmatched`, status: 'ignored', raw: payload, error: 'no matching order' });
    console.error('[grow:invoice] no matching order', { publicOrderId });
    return NextResponse.json({ received: true, matched: false, public_order_id: publicOrderId });
  }

  // Attach the receipt. `invoiceUrl` is the link used when the buyer/admin
  // downloads the invoice from the purchase card. Idempotent.
  await setOrderInvoice(order.id, { documentId: invoiceNumber, documentUrl: invoiceUrl });
  await logEvent({ orderId: order.id, eventId, status: 'processed', raw: payload });

  return NextResponse.json({ received: true, matched: true, order_number: order.public_order_id });
}

/** Stable deterministic hash for an unmatched-event id (no Date/random). */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
