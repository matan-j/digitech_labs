// ============================================================
// app/api/webhooks/grow/invoice/route.ts
// Inbound webhook for the GROW/Meshulam RECEIPT (חשבונית). After a payment
// settles, the invoicing step in Make POSTs the issued receipt here so we can
// attach it to the matching local order. Expected body:
//
//   {
//     "transactionCode": "ABCD1234",                 // == the GROW transactionId
//     "invoiceNumber":   "20",                       // receipt number
//     "invoiceUrl":      "https://secure.meshulam.co.il/..."  // the receipt link
//   }
//
// Matching: `transactionCode` is the same value the payment-success webhook
// stored on the order as provider_transaction_id ({{3.data.transactionId}}).
// We look the order up by that id and store the receipt — `invoiceUrl` becomes
// the order's invoice link (download via /api/account/orders/<id>/invoice).
//
// SECURITY: same optional shared secret as the payment webhook
// (GROW_WEBHOOK_SECRET). Idempotent — re-delivery just re-attaches the same
// receipt. We never grant access here; that only happens on payment-success.
// ============================================================

import { NextResponse } from 'next/server';
import { getOrderByProviderTransactionId, setOrderInvoice } from '@/lib/payments/order-service';
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

  // The GROW transactionId we stored on the order at payment-success time.
  const transactionCode = pick(payload, ['transactionCode', 'transaction_code', 'transactionId', 'transaction_id']);
  const invoiceNumber = pick(payload, ['invoiceNumber', 'invoice_number', 'documentNumber', 'document_number']);
  const invoiceUrl = pick(payload, ['invoiceUrl', 'invoice_url', 'documentUrl', 'document_url', 'url', 'pdf', 'pdfUrl']);

  if (!transactionCode) {
    await logEvent({ orderId: null, eventId: `grow-invoice-no-code-${Math.abs(hashStr(JSON.stringify(payload)))}`, status: 'error', raw: payload, error: 'missing transactionCode' });
    console.error('[grow:invoice] missing transactionCode');
    return NextResponse.json({ error: 'missing_transaction_code' }, { status: 400 });
  }
  if (!invoiceUrl) {
    await logEvent({ orderId: null, eventId: `grow-invoice-${transactionCode}`, status: 'error', raw: payload, error: 'missing invoiceUrl' });
    console.error('[grow:invoice] missing invoiceUrl', { transactionCode });
    return NextResponse.json({ error: 'missing_invoice_url' }, { status: 400 });
  }

  const eventId = `grow-invoice-${transactionCode}`;

  // Match the order by the transaction id the payment-success webhook persisted.
  const order = await getOrderByProviderTransactionId(transactionCode);
  if (!order) {
    await logEvent({ orderId: null, eventId: `${eventId}-unmatched`, status: 'ignored', raw: payload, error: 'no matching order' });
    console.error('[grow:invoice] no matching order', { transactionCode });
    return NextResponse.json({ received: true, matched: false, transactionCode });
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
