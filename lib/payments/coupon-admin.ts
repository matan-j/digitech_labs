// ============================================================
// lib/payments/coupon-admin.ts
// Shared input parsing/validation for the admin coupon routes. Kept out of the
// route files because a Next.js route module may only export HTTP handlers.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Build coupon_products rows, resolving each product's real content_items.type
 * (course / bundle / guide) server-side so the link stores the correct type.
 * Unknown ids fall back to 'course'.
 */
export async function buildCouponProducts(
  supabase: SupabaseClient,
  couponId: string,
  productIds: string[],
): Promise<{ coupon_id: string; content_id: string; content_type: string }[]> {
  if (productIds.length === 0) return [];
  const { data } = await supabase.from('content_items').select('id, type').in('id', productIds);
  const typeById = new Map((data ?? []).map((r) => [r.id as string, r.type as string]));
  return productIds.map((content_id) => ({
    coupon_id: couponId,
    content_id,
    content_type: typeById.get(content_id) ?? 'course',
  }));
}

export type CouponInput = {
  code?: unknown;
  internal_name?: unknown;
  discount_type?: unknown;
  discount_value?: unknown;
  applies_to?: unknown;
  customer_scope?: unknown;
  one_time_scope?: unknown;
  valid_from?: unknown;
  valid_until?: unknown;
  is_active?: unknown;
  product_ids?: unknown;
  customer_ids?: unknown;
};

export type ParsedCoupon = {
  row: Record<string, unknown>;
  productIds: string[];
  customerIds: string[];
};

/** Validate + normalise the coupon payload. Returns the row + links, or an error. */
export function parseCoupon(body: CouponInput): ParsedCoupon | { error: string } {
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9._-]{2,40}$/.test(code)) return { error: 'code_invalid' };

  const discountType = body.discount_type;
  if (discountType !== 'percentage' && discountType !== 'fixed_amount') return { error: 'discount_type_invalid' };

  const discountValue = Number(body.discount_value);
  if (!Number.isFinite(discountValue) || discountValue <= 0) return { error: 'discount_value_invalid' };
  if (discountType === 'percentage' && discountValue > 100) return { error: 'percentage_over_100' };

  const appliesTo = body.applies_to === 'specific' ? 'specific' : 'all';
  const customerScope = body.customer_scope === 'specific' ? 'specific' : 'all';
  const oneTimeScope = ['none', 'global', 'per_customer'].includes(body.one_time_scope as string)
    ? (body.one_time_scope as string)
    : 'none';

  const productIds =
    appliesTo === 'specific' && Array.isArray(body.product_ids)
      ? (body.product_ids as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
  const customerIds =
    customerScope === 'specific' && Array.isArray(body.customer_ids)
      ? (body.customer_ids as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];

  return {
    row: {
      code,
      internal_name:
        typeof body.internal_name === 'string' && body.internal_name.trim() ? body.internal_name.trim() : null,
      discount_type: discountType,
      discount_value: discountValue,
      applies_to: appliesTo,
      customer_scope: customerScope,
      one_time_scope: oneTimeScope,
      valid_from: typeof body.valid_from === 'string' && body.valid_from ? body.valid_from : null,
      valid_until: typeof body.valid_until === 'string' && body.valid_until ? body.valid_until : null,
      is_active: body.is_active === false ? false : true,
    },
    productIds,
    customerIds,
  };
}
