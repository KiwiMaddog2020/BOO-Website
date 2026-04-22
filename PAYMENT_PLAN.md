# BOO — Payment Infrastructure Plan (Canada)

**Status:** Planning only. No code yet.
**Owner:** Kevin
**Last updated:** 2026-04-22

## Goal

Enable BOO to sell merch (physical goods), show tickets, and potentially digital music directly from bunchofothers.com, using payment rails that are native to Canada and minimize friction for Canadian + US/international buyers. Kevin's direction: "whatever the top options are in Canada, we want them" — so the plan supports **multiple processors in parallel**, not a single-vendor lock-in.

## Sales scope to plan for

| Item type | Examples | Volume (estimate) | Notes |
|---|---|---|---|
| Physical merch | T-shirts, vinyl, stickers, posters | low–medium, occasional spikes after shows | Needs inventory + shipping |
| Show tickets | Junkyard June 6 2026, future gigs | low volume per show, high time pressure | Could be venue-handled, or BOO-direct |
| Digital music | Singles, EPs, future LPs | low volume, long tail | Already distributed via Spotify/Apple/YouTube — direct sales optional |

## Top Canadian payment options (2026 landscape)

### 1. **Stripe** — developer-first, Canadian native ⭐ *Primary recommendation*

- **Stripe Canada Inc.** — full Canadian entity; settles to Canadian bank accounts in CAD.
- **Coverage:** credit/debit cards, Apple Pay, Google Pay, Interac Debit (via Payment Element), Link, Afterpay/Klarna.
- **Fees:** 2.9% + 30¢ per domestic card, +0.8% for international cards. No monthly fee.
- **Developer experience:** best-in-class docs, Stripe Checkout (hosted) or Stripe Elements (embedded). Drop-in script + ~20 lines of JS gets you a working checkout on an otherwise-static site like ours.
- **Tax:** Stripe Tax ($$$, optional) can handle GST/HST/PST per province automatically.
- **Fit for BOO:** excellent — keeps the existing vanilla-HTML/CSS/JS architecture, no framework migration, full brand control over the buying experience.
- **Caveat:** PCI compliance concerns if using embedded Elements. Hosted Checkout = Stripe handles PCI, we're SAQ-A compliant (simplest tier).

### 2. **Shopify** — Canadian-built, merch-optimized

- Ottawa-based. Can power a full store OR just the checkout via **Shopify Buy Button** (~$5/month) embedded into our existing site.
- **Coverage:** Shopify Payments (powered by Stripe under the hood) — cards, Apple/Google Pay, Interac, Shop Pay, Afterpay.
- **Fees:** 2.9% + 30¢ (same as Stripe direct), Shop Pay one-tap checkout is a conversion win.
- **Inventory + fulfillment:** Shopify admin handles inventory counts, order status, shipping labels (ShipStation integration or Shopify Shipping with discounted Canada Post rates), order notifications.
- **Fit for BOO:** ideal if we want Kevin + band to manage orders without writing any backend. Buy Button sits alongside custom HTML cleanly.
- **Caveat:** monthly fee ($5 minimum, scales up if we move to full Shopify store). Canadian rates include taxes by default.

### 3. **Bandcamp** — music-industry standard

- Built for bands. Already popular with the indie rock audience BOO targets.
- **Coverage:** cards, PayPal. Merch + music both.
- **Fees:** 15% on digital + ~3–4% payment processing fee; 10% on merch + ~3–4% processing. Higher than Stripe/Shopify on the merch side.
- **Fit for BOO:** **strong for digital music sales specifically** — fans expect to buy BOO's Curiosity LP on Bandcamp, and Bandcamp's music player embeds already work well on custom sites. Less ideal as the *primary* merch checkout because of the fee premium.
- **Caveat:** drives some traffic to Bandcamp's domain rather than keeping users on bunchofothers.com.

### 4. **Square** — in-person-first, with online support

- Canadian entity + currency. Excellent for card readers at shows (2.65% tap/dip, 2.9% + 30¢ online).
- **Fit for BOO:** valuable for **show merch sales at the Junkyard / future gigs** via a Square Reader. Online Square Checkout is competent but trails Stripe/Shopify on DX.
- **Recommendation:** optional secondary for in-person. Don't try to run the website checkout on Square unless avoiding Stripe is a hard requirement.

### 5. **PayPal** — universal familiarity

- Widespread trust, especially with older fans. Canadian entity, CAD support.
- **Fees:** 2.9% + fixed domestic fee (higher than Stripe), 4.4% + fixed for cross-border.
- **Fit for BOO:** offer as a **secondary payment method** alongside Stripe. Many checkout flows add PayPal as a second button. Stripe Checkout can do this natively via "payment_method_types".

### Not recommended for BOO right now

- **Moneris / TD Merchant / RBC Avion** — Canadian bank-backed processors. Higher setup friction, older APIs, worse DX. Fine for established businesses; overkill for a band site.
- **Big Cartel** — niche, weaker analytics, fewer integrations than Shopify.
- **Etsy** — wrong audience fit for a psychedelic rock band, high fees on custom merch.

---

## Recommended stack for BOO

**Primary: Stripe Checkout (hosted)**
- Covers cards, Apple Pay, Google Pay, Interac, Link.
- Embedded via a lightweight script in `index.html` — fits the existing vanilla architecture.
- Zero inventory management overhead for the band (Stripe handles checkout session, we handle product definitions server-side OR client-side if using Stripe-hosted products).
- If Kevin wants inventory tracking, graduate to Shopify Buy Button.

**Secondary: Bandcamp for music**
- Embed Bandcamp's player/buy widgets on the site for the Curiosity LP + future releases.
- Fans who want to support the band financially often prefer Bandcamp anyway; honor that.
- No integration cost beyond pasting an embed snippet.

**Optional: Shopify Buy Button for complex merch**
- If BOO ships merch with real inventory (limited-run vinyl, sized t-shirts with stock), migrate merch-only products to Shopify Buy Button and keep the custom Stripe flow for simple items (stickers, one-off posters).

**Optional: Square Reader for in-person shows**
- At Junkyard and future gigs, a physical Square Reader + Square POS app on a phone handles tap/chip/swipe. Separate from the website.

---

## Integration plan for the site (Stripe primary, phased)

### Phase 1 — Static product definition + Stripe Checkout (smallest viable path)

**Scope:** Sell 1–3 merch items + the Curiosity LP via a "Buy" button that opens Stripe-hosted Checkout.

**What changes in the repo:**
- New section added to `index.html` merch section (currently at `#merch`): replace placeholder merch items with real products + Buy buttons.
- Add `<script src="https://js.stripe.com/v3/"></script>` to `<head>`.
- Define products + prices in Stripe Dashboard (no backend code — products live in Stripe). Copy the Price IDs (`price_xxx`) into the frontend.
- Write ~30 lines of JS: click handler → `stripe.redirectToCheckout({ lineItems: [{price: 'price_xxx', quantity: 1}], mode: 'payment', successUrl: '...', cancelUrl: '...' })`.
- Success page: new `success.html` at repo root that thanks the buyer. Cancel page: returns them to `/#merch`.
- Stripe Dashboard: configure Canadian business entity, enter bank details for CAD payout, set default payment methods (card + Apple Pay + Google Pay + Interac).

**Prerequisites (Kevin's side):**
- Register a sole-proprietorship or incorporate (recommended for liability — bands usually incorporate as numbered companies in BC/AB).
- Open a business bank account (CAD).
- Get a Stripe account, activate with business info.
- GST/HST registration (required if revenue > $30k/year; optional below, but easier to set up early so Stripe Tax can collect from day 1).
- PO Box or home address for merch returns.

**Dev effort:** 4–6 hours once prerequisites are done.
**Ship risk:** low — Stripe Checkout handles PCI, tax, receipts, email delivery, refunds.

### Phase 2 — Bandcamp embeds for music

**Scope:** Drop Bandcamp album embeds into appropriate site spots.

**What changes in the repo:**
- Add Bandcamp-generated iframe snippets into `#merch` section or a new `#music` subsection.
- Zero backend work. Bandcamp manages everything.

**Prerequisites (Kevin's side):**
- Band's Bandcamp page (set up separately, upload music + merch).

**Dev effort:** 30 minutes.

### Phase 3 — Shopify Buy Button if inventory grows

**Scope:** Migrate from static Stripe product definitions to Shopify-managed inventory for any item that needs size/color/stock tracking.

**What changes in the repo:**
- Swap the Stripe Checkout button code for a Shopify Buy Button embed script (~15 lines).
- Site remains otherwise unchanged.

**Prerequisites (Kevin's side):**
- Shopify subscription ($5/month minimum for Buy Button, $29/month for full Shopify Basic).
- Import product photos + variants into Shopify admin.

**Dev effort:** 1–2 hours.

### Phase 4 — Ticket sales (optional, later)

**Options to evaluate when ready:**
- Keep using the venue's ticketing (simplest — Junkyard probably has their own).
- Stripe Payment Links per show (free tier, no code).
- Shopify "events" product type.
- Dedicated ticketing like Eventbrite (~3.5% + $1.59 per ticket) or Showpass (Canadian, used by venues like Red Antler).

---

## Security + compliance checklist

- [ ] **PCI DSS SAQ-A** — using Stripe Checkout (hosted) keeps us in the simplest PCI tier; no card data ever touches bunchofothers.com. **Do not embed Stripe Elements unless we're ready for SAQ-A-EP or higher.**
- [ ] **Privacy policy** — required before accepting payments. Must disclose Stripe/Bandcamp/Shopify data handling, customer data retention, cookie usage. Add as a new `privacy.html` linked from footer.
- [ ] **Terms of service / returns policy** — required by Stripe to activate live payments. Must cover shipping times, return windows, refund policy.
- [ ] **GST/HST collection** — if registered, Stripe Tax auto-applies 5% GST (AB/SK/BC/MB) or 13-15% HST (ON/NS/NB/NL/PEI) or 5%+7%=12% (QC with QST). Rates vary by province; Stripe Tax handles per-province logic.
- [ ] **Cookie notice** — Stripe sets tracking cookies for fraud prevention. Canadian privacy law (PIPEDA) requires disclosure.
- [ ] **Accessibility** — Stripe Checkout is WCAG-AA compliant. Any custom Buy button we add needs keyboard nav + ARIA labels.

---

## Estimated first-year costs (Phase 1 only)

| Line item | Cost |
|---|---|
| Stripe fees | 2.9% + 30¢ per transaction (no minimums, no monthly) |
| Stripe Tax (optional) | 0.5% of transactions using it |
| Domain (existing) | $0 marginal |
| SSL (GitHub Pages handles) | $0 |
| Legal review of privacy/ToS | $0–500 one-time (DIY with templates OR small law firm fee) |
| Business registration (BC sole prop) | $40 one-time |
| **Incremental cost of first sale** | ~$0.50 on a $15 sticker |
| **Cost at $5k sales year 1** | ~$175 in fees total |

Bandcamp embeds add no cost to the site side; Bandcamp's cut comes from the sale itself.

---

## Open questions for Kevin (answer before Phase 1 implementation)

1. **Business structure** — sole proprietorship (Kevin alone, simplest) or incorporated band entity (4-way split, cleaner for royalties + liability, more setup)?
2. **Which products ship first?** — stickers + digital singles are zero-inventory and safest to launch with. Vinyl = preorder model.
3. **Shipping zones** — Canada only, Canada+US, or worldwide? Affects shipping cost calculation complexity.
4. **Brand preference** — keep customers on bunchofothers.com via Stripe Checkout (branded domain), or push them to Shopify's branded checkout (more familiar to some buyers)?
5. **Tax strategy** — register for GST/HST from day 1, or wait until the $30k threshold? Registering early means charging more per sale but getting input tax credits.
6. **Refund/return policy** — digital sales typically final; physical merch needs a written policy (14-day returns? 30-day? defects only?).
7. **Success page** — simple "thanks, check your email" OR full-site confirmation with next-show info, newsletter signup, etc.?

---

## Next steps

When Kevin is ready to implement Phase 1:
1. Answer the Open Questions above.
2. Register business + open bank account (outside-the-repo work).
3. Create Stripe account, configure products.
4. Draft privacy policy + ToS (I can help from templates).
5. Implement the Buy button integration in a new commit (targeting `V1_XX Phase 1 merch checkout`).
6. Test end-to-end with Stripe Test Mode before going live.
7. Flip Stripe to Live Mode, ship to production, monitor first 10 orders closely.
