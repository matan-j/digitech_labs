// lib/learn/registration-rules.ts
// Shared types + constants for admin-managed registration rules (cohort
// auto-grant by signup date). Mirrors the public.registration_rules +
// registration_rule_grants tables from migration 044.

export type GrantResourceType = 'course' | 'bundle';

export type RegistrationRuleGrant = {
  id: string;
  rule_id: string;
  resource_type: GrantResourceType;
  resource_id: string;
  position: number;
};

export type RegistrationRule = {
  id: string;
  name: string;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationRuleWithGrants = RegistrationRule & {
  grants: RegistrationRuleGrant[];
};

/** A single selected resource in the editor (before it gets an id/rule_id). */
export type GrantSelection = {
  resource_type: GrantResourceType;
  resource_id: string;
};

/** The editor's working shape: rule fields + the flat list of selections. */
export type RegistrationRuleDraft = {
  name: string;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  grants: GrantSelection[];
};

/** A course/bundle option offered by the resource multi-picker. */
export type GrantableResource = {
  id: string;
  title: string;
  type: GrantResourceType;
};

/** Defaults for a brand-new rule in the admin form. */
export const NEW_RULE_DEFAULTS: RegistrationRuleDraft = {
  name: '',
  enabled: false,
  starts_at: null,
  ends_at: null,
  grants: [],
};
