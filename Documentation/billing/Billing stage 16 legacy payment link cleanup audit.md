# Billing Stage 16 Legacy Payment Link Cleanup Audit

## Purpose

Stage 16 is a narrow audit before changing more billing behavior. The goal is to identify purchase paths that still bypass the admin-managed billing plans, gateways, provider mappings, checkout session API, webhook verification, and entitlement writers.

No runtime behavior was changed in this stage.

## Scope Checked

- direct Stripe Payment Links
- external purchase links that behave like checkout links
- customer checkout redirects from `/payments`
- billing checkout and portal API usage
- documentation references to older checkout assumptions

## Findings

### Legacy Stripe Payment Links

Direct Stripe Payment Links existed in runtime customer-facing content at audit time.

Files:

- `src/app/teas/page.tsx`
- `src/components/sections/HowItWorksSection.tsx`

Status:

- migrated in Stage 17
- these were runtime checkout bypasses and should not be reintroduced as direct provider links

Audit-time behavior:

- the TEAS page has two `Buy Now - $99` links that open `https://buy.stripe.com/...`
- the How It Works section has a `Buy Exact Teas - $99` link that opens `https://buy.stripe.com/...`
- these links include `success_url` and `cancel_url` values that point back to TEAS pages
- some fallbacks still use `https://teasgurus.com`

Why this matters:

- direct provider links bypass internal plan selection
- direct provider links bypass admin-managed gateway assignment
- direct provider links bypass provider price mappings
- direct provider links bypass checkout attempt audit logging
- direct provider links bypass the server-side live approval control
- direct provider links cannot safely support multiple gateways
- successful redirect pages must not be treated as entitlement proof

Stage 17 cleanup:

- replaced these direct links with the existing internal billing entry behavior
- keep the provider checkout URL created only by `POST /api/billing/checkout/session`
- continue mapping the TEAS package to billing plans and provider price mappings from the admin billing UI

### External Stan Store Purchase Links

External purchase links also exist outside the admin-managed billing system.

Files:

- `src/app/teas-7-practice/page.tsx`
- `src/app/teas-7-practice-old/page.tsx`

Status:

- marked as deferred legacy external checkout
- do not remove until Stan Store is either added as an admin-managed gateway or intentionally retired as a sales channel

Current behavior:

- the TEAS 7 practice pages send users to `stan.store/NursingMocks`
- the newer page records a TikTok `InitiateCheckout` event and then redirects to Stan Store

Why this matters:

- this is not Stripe, but it is still an external checkout bypass
- the purchase does not pass through internal billing plans, gateways, mappings, live approvals, webhook verification, or entitlement writers
- this cannot be managed consistently from the admin billing UI

Recommended cleanup:

- decide whether Stan Store remains a supported payment gateway or becomes a legacy sales channel
- if it remains supported, add it as an admin-managed gateway/provider adapter in a later billing stage
- if it is legacy only, migrate purchase actions to `/payments` after the matching internal plan and package entitlement exist

### Current `/payments` Checkout Flow

The `/payments` page uses the intended server-side billing boundary.

File:

- `src/app/payments/page.tsx`

Current behavior:

- authenticated users request checkout through `POST /api/billing/checkout/session`
- the browser supplies plan ID, optional gateway ID, return URLs, and customer email
- the server resolves the authoritative plan, gateway, provider mapping, checkout readiness, live approval, and provider session
- the browser redirects only to the provider URL returned by the server

Audit result:

- this is the preferred checkout path
- the provider redirect itself is acceptable because it is issued by the server after billing validation
- this path should become the only normal purchase entry point

### Billing Portal Flow

The `/payments` page also uses the intended server-side portal boundary.

File:

- `src/app/payments/page.tsx`

Current behavior:

- authenticated users request the billing portal through `POST /api/billing/portal/session`
- the server resolves the provider customer record
- the browser redirects only to the provider portal URL returned by the server

Audit result:

- no legacy portal bypass was found

## Stage 17 Migration

Keep the next phase small. Stage 17 migration:

- created a controlled migration path for legacy Stripe purchase buttons
- routed TEAS Stripe purchase buttons through the existing internal billing entry behavior
- leave external provider checkout URLs server-created only
- do not remove Stan Store links until the matching billing plan, package entitlement, gateway, and provider mapping are confirmed

## Validation

Commands run:

```text
rg -n "buy\.stripe|buy.stripe|checkout\.stripe|stripe\.com" src public README.md ADMIN_README.md ADMIN_PANEL_README.md .env.example Documentation
rg -n "success_url|cancel_url|successUrl|cancelUrl|NEXT_PUBLIC_SITE_URL|teasgurus.com" src/app src/components src/lib
rg -n "/api/billing/checkout|checkout/session|location\.assign|window\.location|router\.push" src/app src/components src/lib
rg -n "stan\.store|buy\.stripe|payment link|Payment Link|external purchase|Buy Now|Buy Exact|checkout" src public Documentation README.md ADMIN_README.md ADMIN_PANEL_README.md .env.example
```

TypeScript was not run because this stage changed documentation only.
