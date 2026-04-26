# BOO — Payment Infrastructure Plan (Canada)

**Status:** Planning only. Hidden scaffold build begins at V1_77.
**Owner:** Kevin
**Last updated:** 2026-04-25 (V1_85 — Apple Pay + Google Pay activation appendix)

## Goal

Enable BOO to sell merch (physical goods), show tickets, and potentially digital music directly from bunchofothers.com, using payment rails native to Canada while minimizing friction for Canadian + US/international buyers. Kevin's direction: "whatever the top options are in Canada, we want them" — the plan supports **multiple processors in parallel**, not a single-vendor lock-in.

## GitHub Pages constraint (shapes every decision below)

bunchofothers.com is deployed via GitHub Pages, which serves **static files only** — no server-side code, no secrets, no database. That shapes every option below into one of three tiers:

### Tier A — works on pure static (no backend required)
- Stripe Payment Links (redirect to `buy.stripe.com/...`)
- Snipcart (client-side cart + their hosted checkout)
- Shopify Buy Button (iframe embed)
- Bandcamp embeds
- Gumroad external buttons
- Ko-fi external embeds
- Showpass external links

### Tier B — static + Stripe client-side SDK (works via Stripe Dashboard-defined Prices)
- Stripe Checkout (`stripe.redirectToCheckout({ lineItems: [{ price: 'price_xxx' }] })`)
  — no session creation endpoint needed if prices live in Stripe Dashboard

### Tier C — requires a real backend (future scope)
- Webhook handling (order persistence, email receipts, fulfillment triggers)
- Signed URLs for digital download delivery
- Inventory sync across browsers
- Custom fraud logic
- Custom pricing / cart totals

### Firebase as the natural backend extension when we need one
BOO already uses Firebase Firestore for arcade leaderboards. Adding **Firebase Functions** (Node.js serverless) gives us Stripe webhooks, order persistence in a new `orders` collection, email delivery (via SendGrid / Resend), and signed URLs for digital music. Firebase's free Spark tier covers year-1 volume. Graduate to Blaze only if sales take off.

**Rule of thumb:** do NOT add a backend until Phase 1 hits a wall.

## Sales scope to plan for

| Item type | Examples | Volume (estimate) | Notes |
|---|---|---|---|
| Physical merch | T-shirts, vinyl, stickers, posters | low–medium, occasional spikes after shows | Needs inventory + shipping |
| Show tickets | Junkyard Jun 6 2026, future gigs | low volume per show, high time pressure | Could be venue-handled or BOO-direct |
| Digital music | Singles, EPs, future LPs | low volume, long tail | Distributed via Spotify/Apple/YouTube; direct optional |
| Tips / support | "Support the band" button | variable | Donation-friendly, different framing |

## Processor survey (11 options, by category)

### Checkout-first options

#### 1. **Stripe Payment Links** — zero-code hosted checkout ⭐ *Phase 1 recommendation*

- Each product becomes a single hosted URL (`https://buy.stripe.com/xxx`).
- **Fees:** 2.9% + 30¢ CAD per domestic card. No monthly fee.
- **CA-native:** yes. Stripe Canada Inc. entity; CAD payout.
- **Static-site fit:** ⭐⭐⭐ perfect — just an `<a href>`.
- **Coverage:** cards, Apple Pay, Google Pay, Interac, Link, Afterpay/Klarna.
- **Dev effort:** 0 code. HTML only.
- **Upgrade path:** trivially swap `href` → click handler that calls Stripe.js (Tier B) when we need cart logic.
- **Best fit:** 1–10 simple SKUs (stickers, posters, single-item merch).

#### 2. **Stripe Checkout (JS SDK)** — developer-first, full-featured

- Loads `https://js.stripe.com/v3/` + ~30 lines of client-side code.
- **Same fees as Payment Links.**
- **Static-site fit:** ⭐⭐ works (Tier B) with Dashboard-defined Prices; no backend needed.
- **When to choose over Payment Links:** you need multi-item carts, dynamic pricing, or quantity controls inline on the site.
- **Caveat:** PCI SAQ-A tier (simplest) — hosted by Stripe, no card data on our domain.

#### 3. **Snipcart** — built for static sites ⭐ *runner-up for Phase 1*

- Quebec City HQ. Canadian-built cart library.
- **Fees:** 2% Snipcart fee + payment processor fees (~2.9% via Stripe). Free until $500/mo sales; then $29/mo.
- **Static-site fit:** ⭐⭐⭐ designed for this. `<button data-item-id data-item-price>` + script tag.
- **Coverage:** cards, Apple Pay, Google Pay, CAD + Interac.
- **When to choose over Stripe:** you want a real cart (multi-item, quantity adjust, persistent across pages) without writing backend code.
- **Caveat:** the 2% Snipcart fee is on top of processor fees. At $5k/yr sales, that's ~$100 more than Stripe direct.

#### 4. **Helcim** — Canadian processor, better rates at volume

- Calgary-based. Interchange+ pricing.
- **Fees:** ~2.2–2.7% for Canadian cards (vs. Stripe's flat 2.9%). Savings scale with volume.
- **CA-native:** ⭐⭐⭐ yes, very Canadian.
- **Static-site fit:** ⭐⭐ OK via Helcim.js; more setup friction than Stripe.
- **When to choose:** monthly sales > $2k. Below that, the savings don't justify migration effort.
- **Verdict for BOO:** defer until year-2 if Stripe fees become meaningful.

#### 5. **Shopify Buy Button** — managed inventory

- Ottawa-based, Canadian-built.
- **Fees:** 2.9% + 30¢ CAD + $5/mo Buy Button Lite plan. Shop Pay one-tap checkout is a conversion win.
- **Static-site fit:** ⭐⭐⭐ iframe embed alongside our custom HTML.
- **When to choose:** merch with sizes / stock tracking (t-shirts, limited-run vinyl). Shopify admin handles inventory, ShipStation / Shopify Shipping handles labels with discounted Canada Post rates.
- **Upgrade path:** V1_75 Phase 3 — migrate SKU merch to Shopify when inventory tracking matters.

#### 6. **Bandcamp** — music-industry default

- Built for bands. Huge indie-music credibility.
- **Fees:** 15% on digital + ~3–4% processing; 10% on merch + ~3–4% processing.
- **Static-site fit:** ⭐⭐⭐ iframe player/buy embeds.
- **When to choose:** **digital music sales always.** Fans expect to buy the Curiosity LP on Bandcamp. Don't fight it.
- **Trade-off:** higher fees vs. Stripe, but zero integration work and free marketing on Bandcamp's discovery surface.

### External storefronts (off-site redirects)

#### 7. **Gumroad** — creator storefront

- **Fees:** 10% flat on digital + physical.
- **Static-site fit:** ⭐⭐ external link or embeddable buttons.
- **When to choose:** if we want Gumroad to handle digital delivery (secure expiring download links) without setting up our own. Higher fee in exchange for full-service.
- **Verdict for BOO:** overkill — Bandcamp covers music delivery better, and Stripe is cheaper for physical merch.

#### 8. **Ko-fi** — tips + donation-framed shop

- **Fees:** 0% on free tier (processor fees still apply). Gold tier $8/mo unlocks custom domain and themes.
- **Static-site fit:** ⭐⭐⭐ external button or embed.
- **When to choose:** a "Support the Band" / "Tip the Band" button. Ko-fi's donation framing lowers buyer friction for "voluntary extra" payments in a way Stripe doesn't.
- **Recommended placement:** tertiary button on the site, near the social links. Not a primary checkout mechanism.

### In-person + ticketing

#### 9. **Square** — in-person-first + online support

- **Fees:** 2.65% tap/dip in-person, 2.9% + 30¢ online. Canadian entity, CAD.
- **Best fit:** **Square Reader at shows.** A physical reader + Square POS app on a phone handles merch tables at the Junkyard and future gigs. Separate from the website.
- **Don't use Square for:** the website checkout — Stripe DX is much better.

#### 10. **Showpass** — Canadian ticketing

- Alberta-based. Used by Red Antler and many BC/AB venues.
- **Fees:** ~3% + $0.99 per ticket.
- **Best fit:** **BOO-hosted show tickets.** QR tickets, scanning, guest lists, refund handling.
- **Verdict:** defer to Phase 4 — most shows currently run through the venue's own ticketing.

#### 11. **PayPal** — universal, older-fan friendly

- Canadian entity, CAD support.
- **Fees:** 2.9% + fixed domestic fee (higher than Stripe); 4.4% + fixed for cross-border.
- **Best fit:** **secondary button alongside Stripe.** Some fans default to PayPal. Stripe Checkout supports adding PayPal via `payment_method_types`.
- **Placement:** Phase 3 — add after Stripe is live and stable.

### Deliberately NOT considered

- **Moneris / TD Merchant / RBC Avion** — bank-backed processors. Higher friction, older APIs, worse DX. Fine for established businesses; overkill for a band site.
- **Big Cartel** — weaker than Shopify on every axis except price.
- **Etsy** — wrong audience fit.
- **Stripe Elements (embedded card form)** — triggers PCI SAQ-A-EP compliance tier. Overkill for BOO. Use Checkout / Payment Links instead.

---

## Per-product-type recommendation matrix

| Product type | Primary | Why | Secondary |
|---|---|---|---|
| Stickers / posters / simple merch | **Stripe Payment Links** | Zero code, fastest launch | Snipcart if cart needed |
| T-shirts / vinyl / variant merch | **Shopify Buy Button** ($5/mo) | Inventory + sizes + shipping labels | Snipcart + custom admin |
| Digital music (Curiosity LP, singles) | **Bandcamp** | Cultural fit, secure delivery, fans expect it | Gumroad if full brand control |
| Show tickets (BOO-hosted) | **Showpass** | CA-native, QR + scanning, BC/AB venue overlap | Stripe Payment Links for simplest cases |
| Show tickets (venue-hosted) | **Venue's platform** | Junkyard / Red Antler handle their own | N/A |
| Tips / "support the band" | **Ko-fi** (free tier) | Donation branding, 0% platform fee | Stripe Payment Links |
| In-person at gigs | **Square Reader** | Physical card reader, CAD native | Helcim Card Reader |

**Multi-processor site goal**: Stripe as the primary on-site processor, Bandcamp as the music destination, Showpass for tickets, Ko-fi for tips, Square at shows. No single vendor captures everything.

---

## Refined Phase 1 — Stripe Payment Links (hidden via `?beta=pay`)

The lightest possible first step. V1_75's Phase 1 used Stripe Checkout SDK; Payment Links are even simpler and still upgrade-compatible.

### How it works
1. Kevin creates 1–3 products in Stripe Dashboard (e.g., "BOO Sticker — $5 CAD").
2. Stripe generates a hosted checkout URL per product (`https://buy.stripe.com/xxx`).
3. Hidden merch card in `index.html` has `<a class="buy-link" href="https://buy.stripe.com/xxx">Buy — $5</a>`.
4. JS checks URL for `?beta=pay` on page load. If present, `document.body.classList.add('beta-pay')`. Otherwise all `.buy-link` elements stay `display: none` via CSS.

### Dev effort
- HTML + CSS + 5-line JS toggle: 30 minutes.
- Kevin's Stripe setup (Dashboard products + bank): 15 minutes once Stripe account is activated.

### Why Payment Links over Checkout SDK for Phase 1
- No JS library load (Stripe.js is ~50 KB)
- No publishable key visible in the site
- Shareable outside the site (email, Instagram DMs, QR codes)
- Per-link analytics in Stripe Dashboard
- Upgrade to Checkout SDK later = swap `href` for click handler. Trivial.

### Phase 1 deliberately does NOT do
- No cart (one click = one product checkout)
- No per-variant inventory (Payment Links support global quantity limits only)
- No digital delivery (use Bandcamp for music)
- No tickets (defer to Phase 4)

### Apple Pay + Google Pay activation (free, automatic — added V1_85)

Stripe Payment Links automatically display Apple Pay and Google Pay buttons to eligible customers when those wallets are enabled on the Stripe account. Zero code changes on bunchofothers.com — buyers see "Apple Pay" alongside "Card" on the Stripe-hosted checkout, confirm with Face ID / Touch ID, done.

#### Why it's free for static sites
Apple Pay on the web normally requires the merchant to verify their domain with Apple (a `.well-known/apple-developer-merchantid-domain-association` file served from the site root). Stripe Payment Links sidesteps this entirely: checkout happens at `buy.stripe.com` (Stripe's domain), which Stripe has pre-verified with Apple. Same with Google Pay's domain checks. We inherit Stripe's verification — no domain config on our side, no `.well-known/` file on GitHub Pages.

#### Kevin's activation steps (after Stripe account KYC clears)
1. Stripe Dashboard → **Settings** → **Payment methods**.
2. In the "Wallets" section, confirm **Apple Pay** and **Google Pay** are toggled ON. (For new accounts these are usually default-enabled — just verify they didn't get unchecked during KYC.)
3. Done. Existing Payment Links automatically expose the new methods on the next page load — no link regeneration needed.

#### What customers see
- **iPhone Safari / Mac Safari** — Apple Pay button at top of Stripe checkout. Tap → Face ID / Touch ID → confirmed in ~3 seconds.
- **Android Chrome / desktop Chrome with a saved Google Pay card** — Google Pay button. Same one-tap flow.
- **All other browsers** — standard card form (unchanged from current).

#### Why this is a real upgrade
- Musician-and-fan demographics skew iPhone-heavy → high Apple Pay activation rate.
- Checkout time drops from ~20s (typing card + billing address) to ~3s (biometric confirm).
- Stripe's published data shows Apple Pay buyers convert 2–3× more often than card-only buyers on mobile.
- No additional fees beyond Stripe's standard processing rates.

#### Caveats and limits
- Both wallets require HTTPS. bunchofothers.com is HTTPS via GitHub Pages ✓
- Apple Pay on web is **not available** in private / incognito Safari.
- Google Pay button only renders for users with at least one card saved in their Google account.
- Both wallets only show when Stripe verifies the customer is eligible — that happens server-side on Stripe's checkout page, invisible to us.
- For a customer to see Apple Pay, the iPhone needs to be signed into iCloud and have a card in Apple Wallet. ~80%+ of recent iPhone users meet this.

#### What we deliberately did NOT do
- **No "Apple Pay accepted" badges on the merch grid.** Stripe already shows the wallet buttons natively on its checkout page; adding badges to our merch tiles would be redundant and would clutter the design.
- **No domain registration with Apple Pay / Google Pay.** Not needed since checkout lives at `buy.stripe.com`. If we ever migrate from Payment Links to embedded Stripe Elements (Phase 5+), we'd need to register `bunchofothers.com` then. Not before.
- **No backend wallet token handling.** Stripe handles all token exchange server-side on their checkout page.

---

## Phased integration roadmap

### Phase 1 — Stripe Payment Links, hidden (V1_77 + V1_78)
- V1_77: `index.html` feature flag + hidden Buy buttons
- V1_78: `success.html` + `cancel.html` redirect targets
- Kevin's side: register business, create Stripe account, make 1–3 Payment Links

### Phase 2 — Bandcamp music embeds
- Drop Bandcamp player + buy iframe into `#merch` or new `#music` subsection
- Zero integration cost
- Prereq: band's Bandcamp page set up

### Phase 3 — PayPal secondary + Shopify Buy Button (when inventory grows)
- Add PayPal button alongside Stripe (wider acceptance)
- Migrate variant-SKU merch (t-shirts, vinyl) to Shopify Buy Button

### Phase 4 — Ticketing
- Showpass for BOO-hosted shows
- Keep using venue's ticketing for Junkyard / Red Antler / etc.

### Phase 5 — Firebase Functions backend (when Phase 1 hits a wall)
- Stripe webhook endpoint
- Order persistence in Firestore `orders` collection
- Email receipts via SendGrid / Resend
- Signed URL generation for any direct digital delivery

---

## Security + compliance checklist

- [ ] **PCI DSS SAQ-A** — Stripe Payment Links / Checkout keeps us in the simplest tier; no card data ever touches bunchofothers.com. Do NOT embed Stripe Elements unless we're ready for SAQ-A-EP.
- [ ] **Privacy policy** — required before accepting payments. Must disclose Stripe/Bandcamp/Shopify data handling, cookies, PIPEDA compliance. Add as `privacy.html`, linked from footer.
- [ ] **Terms of service / returns policy** — required by Stripe to activate live payments. Cover shipping times, return windows, refund policy.
- [ ] **GST/HST collection** — if registered, Stripe Tax (+0.5%) handles per-province rates: 5% GST (AB/SK/BC/MB), 13–15% HST (ON/NS/NB/NL/PEI), 5% GST + 7% QST (QC). Rates vary; Stripe Tax handles per-province logic.
- [ ] **Cookie notice** — Stripe sets tracking cookies for fraud prevention. PIPEDA requires disclosure.
- [ ] **Accessibility** — Stripe Checkout is WCAG-AA compliant. Custom Buy buttons we add need keyboard nav + ARIA labels.

---

## Estimated first-year costs

| Line item | Cost |
|---|---|
| Stripe fees | 2.9% + 30¢ per transaction (no minimums, no monthly) |
| Stripe Tax (optional) | 0.5% of transactions using it |
| Domain (existing) | $0 marginal |
| SSL (GitHub Pages handles) | $0 |
| Legal review of privacy/ToS | $0–500 one-time |
| Business registration (BC sole prop) | $40 one-time |
| Shopify Buy Button (Phase 3, only if SKU merch ships) | $60/year |
| **Incremental fee per $15 sticker** | ~$0.74 |
| **Total fees at $5k CAD sales year 1** | ~$175 (Stripe only) |

Bandcamp and Ko-fi add no site-side cost; their platform fees come from the sale.

---

## Open questions (answer before live launch, not before V1_77)

1. **Business structure** — sole proprietorship (Kevin alone, simplest) or incorporated band entity (4-way split, cleaner for royalties + liability)?
2. **First products** — stickers + digital singles are zero-inventory and safest to launch with. Vinyl = preorder model.
3. **Shipping zones** — Canada only, Canada + US, or worldwide? Affects shipping cost calc complexity.
4. **Brand preference** — keep customers on bunchofothers.com via Stripe Checkout (branded domain), or Shopify's branded checkout (more familiar to some buyers)?
5. **Tax strategy** — register for GST/HST day 1 or wait until $30k threshold? Early registration = charge more per sale but claim input tax credits.
6. **Refund / return policy** — digital sales typically final; physical merch needs a written policy (14-day? 30-day? defects only?).
7. **Success page content** — simple "thanks, check your email" OR full-site confirmation with next-show info + newsletter signup?

None of these block the hidden scaffold at V1_77 / V1_78. They only block flipping the feature flag to live.

---

## Next commits

- ~~V1_75~~ — previous research (superseded by this revision)
- **V1_76** — this revised `PAYMENT_PLAN.md` (current)
- **V1_77** — `index.html` hidden Buy buttons + feature flag (next)
- **V1_78** — `success.html` + `cancel.html` pages (after V1_77)
- **V1_79+** — live-launch flips after Kevin completes Stripe + legal prereqs

---

## What this plan deliberately leaves out

- No code changes in V1_76 — this file is the only thing that changes.
- No Stripe account creation (Kevin's outside-the-repo work).
- No legal/business structure recommendations beyond flagging the decision.
- No Helcim migration — defer until Stripe's flat 2.9% costs more than Helcim's interchange+ at BOO's actual volume.
- No Firebase Functions backend — defer until Phase 1 hits a wall (digital delivery, email receipts, inventory sync).
