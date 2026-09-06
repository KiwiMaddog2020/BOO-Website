# BOO Merch Plan — Fourthwall

**Status:** Proposal for Kevin's approval. Nothing purchased, no account created, no files committed.
**Owner:** Kevin (band lead / sole dev) — Dev drafted this
**Research date:** All Fourthwall facts below were checked on **2026-09-06**. Prices and fee rates move; re-verify anything older than ~60 days before launch.
**Supersedes:** the *merch* portion of `PAYMENT_PLAN.md` (Stripe Payment Links / Shopify Buy Button for T-shirts and variant SKUs). It does **not** replace that document's advice for **vinyl and CDs, which stay on Bandcamp**, nor its Stripe/Square guidance for tickets, tips, and at-show card payments.

---

## A. Summary + recommendation

### Why Fourthwall for BOO

Kevin's four requirements were: high-quality shirts with the BOO logo, a variety of merch, decent margins, and zero shipping/customer-service hassle. Fourthwall is the only mainstream option that satisfies all four at once, and specifically the fourth one.

| Requirement | How Fourthwall answers it |
|---|---|
| High-quality blanks | Real retail blanks by name — Bella+Canvas 3001, Comfort Colors 1717, Gildan 18500, Independent Trading SS4500, AS Colour heavyweight. Not generic "unisex tee." |
| Variety | 200+ products: tees, long sleeves, hoodies, crewnecks, embroidered hats and beanies, stickers, posters, totes, mugs, phone cases. |
| Decent margins | **0% platform fee on physical products.** You pay only payment processing. Base cost is the only real cost. |
| Zero hassle | **Fourthwall is the Merchant of Record.** They print, ship, handle customer support and returns, and calculate/collect/remit sales tax, GST/HST and VAT. Kevin's only tax job is reporting the payout as income. |

The decisive fact is the Merchant of Record status. Under the old `PAYMENT_PLAN.md` route (Stripe Payment Links or Shopify Buy Button), Kevin personally owns inventory, packing, Canada Post labels, lost-parcel emails, sizing complaints, chargebacks, and — as sales grow across provinces and into the US — sales tax registration. Fourthwall absorbs all of it. The price for that is a print-on-demand base cost that is higher than buying 50 screen-printed shirts wholesale, and shipping that is charged per-order rather than amortised.

### The fees, exactly

| Item | Rate | Applies to BOO? |
|---|---|---|
| Monthly platform fee (Free plan) | **$0** | Yes — start here |
| Fourthwall Pro | $19/mo, or $180/yr (~$15/mo) | Optional. Adds $10/mo rolling shop credit + 0% digital fee. Not needed at launch. |
| Platform fee, **physical products** | **0%** | Yes — this is the whole lineup below |
| Platform fee, digital products | 5% (0% on Pro) | Only if BOO ever sells a download here (Bandcamp is better) |
| Platform fee, memberships | 5% (both plans) | Only if a "BOO Supporters" tier is added later |
| Tips / donations | No platform fee beyond processing | Optional add-on |
| Card processing — **domestic (US)** | 2.9% + $0.30 | US buyers |
| Card processing — **international (incl. Canada)** | **3.9% + $0.30** | **Most BOO buyers.** Fourthwall's processor is US-domiciled, so a Kelowna buyer is an "international" card. Budget the higher rate. |
| PayPal — domestic | 3.49% + $0.49 | Buyer's choice |
| PayPal — international | 4.99% + $0.49 | Buyer's choice |
| Shipping | Charged to the buyer at dynamic carrier rates | Not a cost to BOO |

Net effect: on a $25 USD tee bought by a Canadian, BOO nets about **$12**. Nothing is deducted for platform, tax handling, support, or fulfillment.

### Payouts to Canada

- Payouts run **on a rolling monthly basis for balances over $25**; the first payout lands in the first week of the following month and covers that month's earnings.
- Payouts go to a bank account or debit card and run **through Stripe (Stripe Connect)**.
- The payout currency **matches the Stripe Connect country** and cannot be set independently — a Canadian Stripe Connect account therefore pays out in **CAD**. Confirm this on the payout screen during setup (see Checklist step 3); it is the one Canada-specific item worth eyeballing rather than trusting.
- Your dashboard, profits, and order values are always displayed in **USD**, even though buyers pay in their own currency.
- Fourthwall may hold a rolling reserve to cover chargebacks, disputes, and refunds, as permitted by its Terms of Service. Normal; just don't plan on same-week cash.

### Who does what

| Claude (Dev) does | Kevin does (needs his login) |
|---|---|
| This plan, pricing math, SKU list | Create the Fourthwall account |
| All product copy (Section E) | Payout + tax details (Stripe Connect, T-slip info) |
| Shop settings sheet, About text, FAQ answers (Section D) | Upload artwork and configure each product in the designer |
| Exact setup checklist (Section F) | Order samples and judge them in person |
| Website integration spec (Section G) — a second agent implements | Add the DNS record at the registrar for `shop.bunchofothers.com` |
| Wiring the real product cards into `index.html` once Kevin returns the URLs | Hit publish; connect Instagram / YouTube / Spotify |

Everything Claude cannot do is a login-gated action. Section F is written so those add up to roughly 30 minutes, plus waiting on DNS and samples.

**Sources checked 2026-09-06:** [Transaction fees](https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/transaction-fees) · [Plans & pricing](https://fourthwall.com/pricing) · [Fourthwall pricing breakdown (ecomm.design)](https://ecomm.design/fourthwall-pricing/) · [Nov 1 rate changes: international card & PayPal](https://fourthwall.com/blog/upcoming-rate-update) · [What is a Merchant of Record?](https://fourthwall.com/blog/what-is-a-merchant-of-record-a-deep-dive-into-sales-tax-management-for-creators) · [Creator tax information FAQ](https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/creator-tax-information) · [Payout timing and schedules](https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/understanding-payout-timing-schedules-and-troubleshooting) · [Multi-currency settings](https://help.fourthwall.com/manage-my-shop/shop-settings/multi-currency-settings) · [Fourthwall Pro FAQs](https://help.fourthwall.com/frequently-asked-questions/account-and-plans/fourthwall-pro-faqs)

---

## B. Product lineup v1

### Ground rules used

- **Garments are black** with the white logo, except one light colourway (Comfort Colors Ivory) carrying the black logo.
- **Print method is DTFx** (Fourthwall's direct-to-film) on every garment. DTFx lays ink *on top* of the fabric instead of soaking in, which is exactly what a one-colour white logo on black cotton needs — DTG's weakness is white ink on dark garments. Hats and beanies are **embroidery**.
- Artwork filenames refer to files in `merch/artwork/`, produced by a second agent. Confirmed present: `boo-logo-white.svg`, `boo-logo-black.svg`, `boo-logo-front-white-4500x5400.png`, `boo-logo-front-black-4500x5400.png`, `boo-logo-leftchest-white-1200.png`, `boo-logo-leftchest-black-1200.png`, `boo-hat-embroidery.svg`, `boo-hat-embroidery-white-1600.png` (raster fallback if the designer rejects SVG), `boo-sticker-diecut.png`, `boo-sticker-diecut-dark.png` (light-background variant).
- **Base cost** is the published "from" price, which is the smallest/cheapest size. **2XL and 3XL cost more** — Fourthwall shows the uplift per size in the designer. Retail is normally kept flat across sizes, so the big sizes carry a thinner margin; that is standard and fine.
- **Margin math is conservative**: it assumes an international (Canadian) card at 3.9% + $0.30. A US buyer nets about 1% more. It also assumes the processing fee falls on the product price alone; in reality the percentage applies to the whole order total including shipping, so a single-item order nets a little less than shown and a multi-item order nets a little more per item.
- **CAD figures are indicative only.** Kevin sets prices in **USD**; Fourthwall geolocates the buyer and shows one of 17 local currencies including CAD. Converted at **1 USD = 1.38 CAD** (rate on 2026-09-06).

### The lineup

| # | Product | Blank | Colours | Print / placement | Artwork file | Base cost (USD) | Retail USD | Buyer sees (CAD) | Net profit | Margin | Wave |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Classic Tee | Bella+Canvas 3001 | Black | DTFx, full front (~11 in wide) | `boo-logo-front-white-4500x5400.png` | $11.75 | **$25** | ~$35 | $11.98 | 48% | **Launch** |
| 2 | Heavyweight Tee | Comfort Colors 1717 | Black + Ivory | DTFx, full front | Black: `...front-white-4500x5400.png` / Ivory: `...front-black-4500x5400.png` | $15.45 | **$32** | ~$44 | $15.00 | 47% | **Launch** |
| 3 | Pullover Hoodie | Gildan 18500 | Black | DTFx, full front | `boo-logo-front-white-4500x5400.png` | $22.20 | **$49** | ~$68 | $24.59 | 50% | **Launch** |
| 4 | Dad Hat | Embroidered dad hat (see note) | Black | Embroidery, front panel | `boo-hat-embroidery.svg` | $15.65 | **$30** | ~$41 | $12.88 | 43% | **Launch** |
| 5 | Die-Cut Sticker | Vinyl die-cut, 3 in | n/a | Full-colour die-cut | `boo-sticker-diecut.png` | $3.78 | **$7** | ~$10 | $2.65 | 38% | **Launch** |
| 6 | Long Sleeve Tee | Long sleeve tee (B+C 3501 or catalogue equivalent) | Black | DTFx, full front + left-sleeve logo | Front: `...front-white-4500x5400.png` / sleeve: `boo-logo-leftchest-white-1200.png` | $14.75 | **$32** | ~$44 | $15.70 | 49% | Wave 2 |
| 7 | Crewneck Sweatshirt | Crewneck (Gildan 18000 / Independent Trading equivalent) | Black | DTFx, left chest only | `boo-logo-leftchest-white-1200.png` | $18.35 | **$42** | ~$58 | $21.71 | 52% | Wave 2 |
| 8 | Beanie | Atlantis Ribbed Knit Beanie | Black | Embroidery, cuff | `boo-hat-embroidery.svg` | $16.25 | **$32** | ~$44 | $14.20 | 44% | Wave 2 |
| 9 | Sticker 3-Pack | Kiss-cut sheet **or** bundle of 3 die-cuts | n/a | Full-colour | `boo-sticker-diecut.png` (+2 variants) | ~$11.34 as a 3-item bundle | **$18** | ~$25 | $5.66 | 31% | Wave 2 |
| 10 | Poster 18x24 | 200gsm matte art paper | n/a | Full-bleed digital | `Images/CuriosityAlbumCover.png` (fallback: `boo-logo-white.svg` on black) | ~$9.50 (**unconfirmed**, see note) | **$22** | ~$30 | $11.34 | 52% | Wave 2 |
| 11 | Tote Bag | Cotton tote | Natural | DTFx, centre panel | `boo-logo-front-black-4500x5400.png` | $17.00 | **$32** | ~$44 | $13.45 | 42% | Wave 2 |

**Launch day = 5 SKUs:** Classic Tee, Heavyweight Tee, Pullover Hoodie, Dad Hat, Die-Cut Sticker. That is one entry-price shirt, one premium shirt, one big-ticket item, one non-apparel wearable, and one impulse add-on — the minimum set that makes a shop look like a shop rather than a test page.

**Wave 2 = the remaining 6,** added roughly 4 to 6 weeks after launch or immediately before the Okanagan Tattoo Show (Jul 18, 2026), whichever comes first. Adding SKUs later gives a second "new merch" announcement for free.

### Per-row notes

1. **Classic Tee (B+C 3001).** The reference band tee: fitted, lightweight, retail-shop feel, the widest colour range in the catalogue, and a smooth surface that takes fine detail cleanly. This is the volume SKU.
2. **Heavyweight Tee (Comfort Colors 1717).** Garment-dyed, heavy, broken-in feel off the rack — the "vintage tour shirt" a psych-rock audience actually wants. The Ivory colourway is the one light garment in the lineup and the only place the black logo appears on a shirt. Garment-dyed cotton varies slightly shirt to shirt; that is the look, not a defect, and the product copy says so.
3. **Hoodie (Gildan 18500).** Midweight, universally recognised fit, and the lowest base cost among hoodies that still feel decent. Independent Trading SS4500 is the upgrade path if a sample disappoints — it is in the catalogue and reads more premium at a higher base cost.
4. **Dad Hat.** Hats in the catalogue start around $15.65 and specific styles run higher (the Beechfield Pastel Dad Hat is listed from $18.50). **Kevin must confirm the exact hat SKU and its base cost in the designer**, then adjust retail to hold the ~43% margin. Embroidered, not printed — see Section 5 for why.
5. **Die-Cut Sticker.** Vinyl, 3 in. Thin margin in dollars, but stickers exist to be thrown in the cart, to sit on the merch table free, and to push carts over any free-shipping threshold. Stickers in the catalogue start from $2.29 (kiss-cut); die-cut from $3.78.
6. **Long Sleeve.** Sleeve print is the detail that distinguishes a long sleeve from "a tee with more fabric." Use the left-chest file on the sleeve; it is already sized for a small placement.
7. **Crewneck.** Deliberately **left chest only** — a small embroidered-looking logo on a black crewneck is the most wearable thing in the whole lineup and the one people wear when they are not at a show.
8. **Beanie.** Kelowna, and BC generally, sells beanies from October to April. Confirm the exact beanie SKU: beanies start from $13.79 and the Atlantis Ribbed Knit is listed at $16.25.
9. **Sticker 3-Pack.** Prefer a **single kiss-cut sheet** SKU if the catalogue has one at a sane size — one base cost instead of three, and the margin roughly doubles. If not, build it as a Fourthwall bundle of three die-cuts, which is what the numbers above assume.
10. **Poster.** Posters start from $5.50 and print on 200gsm matte art paper; framed posters start from $20.35. **The 18x24 base cost is not published — it is an estimate.** Kevin reads the real number in the designer and the retail price moves to match. The Curiosity cover is the better seller here; a logo-on-black poster is the fallback if the cover art does not hold up at 18x24 (see Risks).
11. **Tote.** Bags start from $17.00, which makes the tote the weakest margin in the apparel-adjacent set. Kept in wave 2 for that reason, and priced as a mid-ticket item rather than an add-on.

**Sources checked 2026-09-06:** [Custom t-shirts](https://fourthwall.com/design-and-sell/custom-t-shirts) · [Comfort Colors Garment-Dyed Heavyweight Tee](https://fourthwall.com/products/comfort-colors-garment-dyed-heavyweight-t-shirt-dtfx-2) · [Custom hoodies](https://fourthwall.com/design-and-sell/custom-hoodies) · [Custom crewnecks](https://fourthwall.com/design-and-sell/custom-crewnecks) · [Custom long sleeve tees](https://fourthwall.com/design-and-sell/custom-long-sleeve-tees) · [Hats catalogue](https://fourthwall.com/products/category/hats-890bc) · [Custom beanies](https://fourthwall.com/design-and-sell/custom-beanies) · [Stickers catalogue](https://fourthwall.com/products/category/stickers-864f5) · [Die-cut stickers](https://fourthwall.com/products/die-cut-stickers-sticker) · [Custom posters](https://fourthwall.com/design-and-sell/custom-posters) · [Custom printed bags](https://fourthwall.com/design-and-sell/custom-printed-bags) · [What blanks to use (men's)](https://help.fourthwall.com/create-and-sell-products/best-practices/what-blanks-to-use-mens-edition) · [8 best quality shirts for printing on Fourthwall](https://fourthwall.com/blog/best-quality-shirts-for-printing-on-fourthwall)

---

## C. Pricing strategy

### On the 35-45% target

Treat 35-45% as the **floor**, not the goal. Because Fourthwall charges 0% platform fee on physical goods, the only deduction is processing, and the lineup above naturally lands at **42-52%** at prices that are still normal for a band. Pushing prices down to land exactly inside 35-45% would mean a $21 USD tee — cheap for the format, and a signal that the shirt is cheap.

If Kevin wants to be aggressive anyway (first drop, small audience, priority on units over dollars), here is the price that hits exactly 40%:

| SKU | Recommended USD | Margin | Price for exactly 40% | Difference |
|---|---|---|---|---|
| Classic Tee | $25 | 48% | $21 | -$4 |
| Heavyweight Tee | $32 | 47% | $27 | -$5 |
| Hoodie | $49 | 50% | $38 | -$11 |
| Dad Hat | $30 | 43% | $27 | -$3 |
| Long Sleeve | $32 | 49% | $26 | -$6 |
| Crewneck | $42 | 52% | $32 | -$10 |
| Beanie | $32 | 44% | $28 | -$4 |
| Tote | $32 | 42% | $30 | -$2 |

Recommendation: **ship the higher column.** Raising prices later reads as a cash grab; discounting later reads as a sale.

### Psychological price points

- **Set prices in whole USD dollars.** Because Fourthwall converts to CAD by geolocation, a "clean" USD number arrives as an odd CAD number anyway. $24.99 USD becomes ~$34.49 CAD, which looks worse than ~$34.50 from a flat $25. Whole dollars in, tidy conversions out.
- **Keep a visible ladder:** $7 sticker, $18 sticker pack, $25 tee, $30 hat, $32 premium tee, $42 crewneck, $49 hoodie. Every step up is a real jump in perceived value, and the $7 sticker anchors the tee as reasonable.
- **$49, not $50.** The hoodie is the only place where crossing a round number actually costs conversions.
- **$25 flat for the classic tee** is a merch-table number. It survives being read aloud at a show, and it is memorable in both currencies.

### Bundles Fourthwall supports

Fourthwall has native promo codes and product bundles, and creators set their own free-shipping thresholds.

| Bundle | Contents | Bundle price USD | vs à la carte | Why |
|---|---|---|---|---|
| **Show Kit** | Classic Tee + Die-Cut Sticker | $28 | saves $4 | Bumps the sticker's attach rate to near-100% at almost no margin cost |
| **Cold Snap** | Hoodie + Beanie | $72 | saves $9 | Wave 2, seasonal, biggest single order value in the shop |
| **Wall + Wear** | Heavyweight Tee + 18x24 Poster | $46 | saves $8 | Wave 2, pairs the shirt with the Curiosity art |
| **Sticker 3-Pack** | 3 die-cut variants | $18 | saves $3 | Standalone SKU, doubles as the cheapest thing worth shipping |

Set the **free-shipping threshold at $75 USD**, which is roughly one hoodie plus anything, or two shirts. It is the single most effective lever on average order value in a print-on-demand shop, and it pays for itself because shipping is billed to the buyer, not to BOO.

### Launch promo

- **Code `FIRSTWAVE` — 15% off, first 50 orders, 14 days.** Limited-quantity codes are supported. 15% off a 48% margin still leaves ~37% — inside the floor even at the discount.
- Announce once on Instagram with the shop link, once from the site's merch section, and once in the YouTube description of the most recent video.
- Do **not** discount the hoodie separately. It is the halo product; let the sitewide code cover it.
- After the promo lapses, the standing offers are the bundles and the $75 free-shipping threshold. No permanent sitewide discount.

**Sources checked 2026-09-06:** [Promo codes](https://fourthwall.com/features/promo-codes) · [Create a promo code](https://help.fourthwall.com/create-and-sell-products/how-to-guides/create-promo-code) · [Multi-currency settings](https://help.fourthwall.com/manage-my-shop/shop-settings/multi-currency-settings)

---

## D. Shop settings sheet

Everything in this section is copy-paste ready.

### Identity

| Field | Value |
|---|---|
| Shop name | `Bunch of Others` |
| Shop handle / Fourthwall URL | `bunchofothers` (yields `bunchofothers-shop.fourthwall.com` or similar until the custom domain is live) |
| Custom domain | `shop.bunchofothers.com` |
| Tagline | `Psychedelic rock out of Kelowna, BC.` |
| Support email shown to buyers | Fourthwall provides one; point it at Kevin's band address if it asks |
| Currency (creator-side) | USD (dashboard is always USD) |
| Buyer currency | Automatic by geolocation, CAD included; leave the currency toggle enabled |

### About text (3 paragraphs, band voice)

> Bunch of Others is a four-piece psychedelic rock band out of Kelowna, British Columbia. Jeff on guitar and vocals, Joe on guitar, Johnny on drums, Shawn on bass. Loud where it should be loud, patient where it shouldn't.
>
> The debut record, *Curiosity*, came out December 2025 and is on every platform worth having. Everything here — shirts, hats, stickers, prints — carries the same logo you'll see on the kick drum.
>
> Printed and shipped on demand, so nothing sits in a box in somebody's garage. Order it, we make it, it turns up. Vinyl and CDs live over on Bandcamp.

### Collections

| Collection | Contains | Notes |
|---|---|---|
| `All` | Everything | Built-in; the Storefront API exposes it as the `all` handle |
| `Shirts` | Classic Tee, Heavyweight Tee, Long Sleeve | The first thing a visitor should see |
| `Heavyweight` | Hoodie, Crewneck | Wave 2 lands here |
| `Hats & Headwear` | Dad Hat, Beanie | |
| `Small Stuff` | Die-Cut Sticker, Sticker 3-Pack, Poster, Tote | The under-$35 shelf |
| `Bundles` | Show Kit, Cold Snap, Wall + Wear | Wave 2 |

Set `Shirts` as the featured collection on the homepage.

### Shipping / returns FAQ answers

Copy these into the shop's FAQ page.

**How long does it take?**
> Everything is made when you order it. Production takes a few business days, then shipping. Most orders land within 5 to 8 days.

**Do you ship to Canada?**
> Yes, and to most of the world. Shipping is calculated at checkout based on where you are and how big the box is — no flat fee, no markup.

**Will I get charged customs or duty?**
> Possibly, depending on where you live and which facility your order ships from. Most orders ship duty-unpaid, which means the carrier may collect import fees on delivery. We can't predict the amount, and it isn't something we charge or receive.

**Can I return it?**
> Everything is made to order, so we can't take returns for a change of mind or the wrong size picked at checkout. Check the size chart on the product page before you order. If the item shows up damaged, misprinted, or is the wrong size from what you ordered, get in touch within 30 days of delivery and it gets replaced.

**Where do I ask about an order?**
> Use the contact link on this shop. Order questions, address changes, and replacements are all handled there.

**What about vinyl and CDs?**
> Physical music is on Bandcamp, not here.

### Social links

| Platform | URL |
|---|---|
| Instagram | https://instagram.com/bunch_of_others |
| YouTube | https://youtube.com/@BunchOfOthersMusic |
| Spotify | https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP |
| Apple Music | https://music.apple.com/us/artist/bunch-of-others/1754588177 |
| Band site | https://bunchofothers.com |

### Brand colours and fonts

Fourthwall's Style tab exposes colour pairs, typography, and layout, plus an "edit code" escape hatch for finer control.

| Slot | Value | Notes |
|---|---|---|
| Page background | `#0a0a0a` | Near-black, not pure black — keeps product photos from floating |
| Primary text | `#ffffff` | |
| Primary accent / buttons | `#00ffff` cyan | Site primary |
| Secondary accent / hover | `#ff1493` magenta | Site secondary |
| Tertiary accent | `#9b30ff` purple | Sparingly — badges, sale flags |
| Button text | `#0a0a0a` on cyan | Dark text on a neon fill; never neon on neon |

**Fonts.** The site uses Oxanium (body/UI) and Poppins (navigation). Fourthwall's font picker is a fixed list, so exact matches are unlikely.

| Site font | Use | Closest likely Fourthwall option | Fallback order |
|---|---|---|---|
| Oxanium | Headings, product titles | Any squared/techno geometric face in the list | Chakra Petch, Rajdhani, Space Grotesk, then Montserrat |
| Poppins | Body, nav, buttons | Poppins is common in these pickers — check for it first | Inter, DM Sans, Work Sans |

If neither Oxanium nor a squared face is available, run **Poppins for everything** rather than mismatching. If Kevin wants an exact match later, the Style tab's edit-code option can pull Oxanium from Google Fonts — a wave-2 polish item, not a launch blocker.

### Hero image

**Use `Images/BOO_BandShot.webp`** as the storefront hero. A merch shop's hero should show people, not packaging — a band photo says "this is a real band" faster than a logo does, and it gives the neon accents something to sit on.

Keep **`Images/CuriosityAlbumCover.png`** for a second-row banner linking to Bandcamp, and as the artwork on the 18x24 poster.

If the band shot crops badly at wide desktop aspect ratios, `Images/BOO_JeffBanner.webp` is the fallback — it is already banner-shaped.

**Sources checked 2026-09-06:** [Fourthwall site design options](https://help.fourthwall.com/getting-started/design-my-storefront/site-design-options) · [Custom themes](https://fourthwall.com/features/custom-themes) · [Returns, refunds & quality issues](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/returns-refunds-and-quality-issues) · [Shipping and delivery expectations](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/shipping-and-delivery-expectations)

---

## E. Product copy

Short, flat, no adjectives doing work the product should do. Size/fit notes matter more than adjectives in print-on-demand, because sizing complaints are the number one cause of a return that Fourthwall will not accept.

### 1. Classic Tee — launch

**Title:** BOO Logo Tee — Black
**Description:** The logo, big, on a black Bella+Canvas 3001. Soft, fitted through the body, holds its shape after the wash.
**Size / fit:** Unisex sizing, runs slim. Between sizes, or want it loose, take the next size up. Chest measurements are on the size chart.

### 2. Heavyweight Tee — launch

**Title:** Heavyweight Logo Tee
**Description:** Comfort Colors 1717 — garment-dyed, thick, already broken in. Black with the white logo, or Ivory with the black. The one you'll keep reaching for.
**Size / fit:** Boxy and relaxed. Runs a full size larger than a standard tee — order your normal size for a roomy fit, one down if you want it closer. Garment dyeing means slight shade variation shirt to shirt; that's the process.

### 3. Pullover Hoodie — launch

**Title:** BOO Logo Hoodie — Black
**Description:** Midweight pullover, black, white logo across the chest. Front pouch, drawcord hood, nothing clever.
**Size / fit:** Unisex, true to size with room to layer. Size up if you want it oversized.

### 4. Dad Hat — launch

**Title:** BOO Embroidered Dad Hat
**Description:** Low-profile six-panel in black, logo stitched on the front panel. Embroidered, not printed — it won't crack or peel.
**Size / fit:** One size, adjustable strap. Unstructured crown, so it sits low rather than standing up.

### 5. Die-Cut Sticker — launch

**Title:** BOO Logo Sticker
**Description:** Three-inch die-cut vinyl, cut to the shape of the logo. Weatherproof. Goes on the case, the laptop, the bumper, the amp.
**Size / fit:** Approximately 3 in at the widest point. Outdoor-rated vinyl.

### 6. Long Sleeve Tee — wave 2

**Title:** BOO Long Sleeve — Black
**Description:** Logo on the chest, second hit down the left sleeve. Black, cotton, the standard uniform for a cold venue.
**Size / fit:** Unisex, true to size, slim through the body and sleeve. Size up for a relaxed fit.

### 7. Crewneck Sweatshirt — wave 2

**Title:** BOO Crewneck — Black
**Description:** Small logo, left chest, black crewneck. The quiet one — wear it somewhere that isn't a show.
**Size / fit:** Unisex, true to size, ribbed cuffs and hem. Size up to layer over a hoodie-weight shirt.

### 8. Beanie — wave 2

**Title:** BOO Ribbed Beanie
**Description:** Black ribbed knit with the logo embroidered on the cuff. Made for a Kelowna January.
**Size / fit:** One size, stretch fit. Cuffed — fold it once for a shorter fit, twice for a tighter one.

### 9. Sticker 3-Pack — wave 2

**Title:** BOO Sticker Pack — 3 Stickers
**Description:** Three die-cut vinyl stickers, three logo variants. Cheapest way to put BOO on something.
**Size / fit:** Each approximately 3 in at the widest point. Outdoor-rated vinyl.

### 10. Poster 18x24 — wave 2

**Title:** Curiosity — 18x24 Poster
**Description:** The *Curiosity* cover art, printed at 18 by 24 inches on 200gsm matte art paper. Ships rolled in a tube.
**Size / fit:** 18 x 24 in. Unframed. Matte stock, so no glare under a lamp.

### 11. Tote Bag — wave 2

**Title:** BOO Tote — Natural
**Description:** Natural cotton tote with the black logo. Big enough for a record, a laptop, or a night's worth of nothing in particular.
**Size / fit:** One size. Check the product page for exact dimensions and handle drop.

---

## F. Kevin's setup checklist

Login-gated work only. Roughly 30 minutes of active time, plus waiting on DNS propagation and sample delivery. Do steps 1 through 5 in one sitting; step 6 (samples) has a delivery gap; step 7 (DNS) can run in parallel; steps 8 through 10 finish it.

Fourthwall changes its dashboard wording periodically. Where a menu path is quoted below it was confirmed on 2026-09-06; if a label differs slightly, the section it lives under will still be right.

### 1. Create the account (5 min)

1. Go to `fourthwall.com` and click **Sign up** / **Get started**.
2. Sign up with the band's email address, not a personal one — this becomes the sender identity on order emails.
3. When asked what you make, choose the musician/band option. It biases the template suggestions toward merch rather than streaming overlays.
4. Set the shop name to **Bunch of Others** and the handle to **bunchofothers**.
5. Stay on the **Free plan**. Physical products carry 0% platform fee on Free; the $19/mo Pro plan only pays for itself if BOO starts selling digital goods or wants the $10/mo sample credit. Revisit in six months.

### 2. Payout details (5 min)

1. Open **Settings → Payouts** (may read "Payments" or "Get paid").
2. Choose bank account or debit card and complete the **Stripe Connect** onboarding when it appears.
3. Select **Canada** as the country. This is the step that determines the payout currency — Stripe Connect pays out in the country's currency, so Canada means **CAD**. Confirm the currency shown on the confirmation screen before finishing; if it shows USD, stop and contact support@fourthwall.com rather than proceeding.
4. Have ready: Canadian bank transit + institution + account number (or the debit card), legal name and address, and date of birth. Stripe will ask for identity verification.
5. Note the payout rule: **rolling monthly, balances over $25**, first payout in the first week of the following month.

### 3. Tax details (5 min)

1. Open **Settings → Taxes** (or the tax step inside payout onboarding).
2. As a non-US person, expect a **W-8BEN** (individual) or **W-8BEN-E** (if the band is incorporated). Fill it as an individual unless BOO is a registered company.
3. There is **nothing to configure for sales tax, GST, HST, or VAT.** Fourthwall is the Merchant of Record and calculates, collects, and remits all of it. Tax collected is withheld from payouts, not included in them.
4. Kevin's only obligation is reporting the payouts as income on his Canadian return. Keep the monthly payout statements.

### 4. Shop branding (10 min)

1. Go to the site editor (**Site** or **Design** in the left nav) and pick a template. Prefer one **with a hero banner** so the band shot has somewhere to go; the hero-less templates (Oasis and similar) are the wrong pick here.
2. Open the **Style** tab and set the palette from Section D: background `#0a0a0a`, text `#ffffff`, primary accent `#00ffff`, secondary `#ff1493`.
3. Set typography. Look for Oxanium first; if absent, try Chakra Petch or Rajdhani for headings and Poppins for body. If neither squared face exists, set Poppins throughout.
4. Upload `Images/BOO_BandShot.webp` as the hero image.
5. Upload `merch/artwork/boo-logo-white.svg` as the shop logo (site header + favicon).
6. Paste the About text and the FAQ answers from Section D into the About and FAQ pages.
7. Add the five social links from Section D to the footer.

### 5. Add the launch-day products (15 min, 3 min each)

For each of the five launch SKUs:

1. **Products → Add product → Browse catalogue.**
2. Search the blank by name (`Bella Canvas 3001`, `Comfort Colors 1717`, `Gildan 18500`, dad hat, die-cut sticker) and select it.
3. **Record the real base cost shown for the size you expect to sell most** — the "from" prices in Section B are the smallest size and may have drifted.
4. Select colours: **Black** only, except the Heavyweight Tee which gets **Black + Ivory**.
5. Deselect any sizes you don't want to carry. Recommended range: **S through 2XL** for tees and long sleeves, **S through 2XL** for hoodie and crewneck. 3XL adds base cost and a size-chart argument; skip at launch.
6. Open the print region (Front) and upload the artwork file named in the Section B table. Keep the design inside the dotted print-safe box the designer overlays.
7. For the hat: choose the **embroidery** option, not print, and upload `boo-hat-embroidery.svg`.
8. Set the price from the Section B table (USD).
9. Paste the title, description, and size/fit note from Section E.
10. Assign the product to its collection from Section D.
11. Save as **draft** — do not publish yet. Publishing happens in step 8, after samples.

If any base cost differs from Section B by more than about $2, adjust the retail price to hold the target margin: `retail = (base + 0.30) / 0.55` gives roughly 45%, `(base + 0.30) / 0.51` gives roughly 50%.

### 6. Order samples (5 min to order, then wait)

1. **Products → [product] → Order sample**, or the Samples entry in the dashboard.
2. **Samples are priced at cost** — manufacturing price, no markup. Shipping is extra.
3. Order at minimum: **the Classic Tee, the Heavyweight Tee, and the Dad Hat.** Those three are where a print or stitch problem is most likely and most visible. Add the hoodie if budget allows — it is the most expensive thing a buyer can get wrong.
4. Order the tee in the size Kevin actually wears, so the fit note in Section E can be corrected from experience rather than a chart.
5. Judge specifically: white-on-black opacity (is the logo bright or grey?), print hand (DTFx leaves a thin ~0.1mm film with a slight sheen — expected, not a defect), edge crispness, and whether the hat embroidery kept the logo's thin strokes.
6. There are **no bulk discounts** on catalogue print-on-demand products. For a merch table, the options are (a) order samples at cost in quantity, which is the cheapest route through Fourthwall, or (b) get shirts screen-printed locally in Kelowna for the table and keep Fourthwall for online only. See Risks.

### 7. Custom domain — `shop.bunchofothers.com` (5 min + propagation)

Context: `bunchofothers.com` is served by **GitHub Pages**, and its DNS lives at whichever registrar Kevin bought the domain from (the repo has no `CNAME` file, so the apex is configured in the GitHub Pages settings UI). **Using a subdomain means nothing about the main site changes.** GitHub Pages keeps the apex and `www`; Fourthwall gets `shop` only. No conflict, no risk to the live site.

1. In Fourthwall: **Settings → Domains → Connect domain.**
2. Enter `shop.bunchofothers.com` — no `https://`, no trailing slash.
3. Fourthwall will offer to configure DNS automatically via **Entri** if the registrar is supported. If that appears, authorise it and skip to step 7.
4. Otherwise Fourthwall displays the manual record. **For a subdomain this is a CNAME.** Fourthwall does not publish the target value publicly; it is shown on that screen. Expect:

   | Type | Host / Name | Value | TTL |
   |---|---|---|---|
   | `CNAME` | `shop` | *(the target Fourthwall shows on the Connect Domain screen)* | Automatic / 3600 |

   The apex `A` records Fourthwall documents elsewhere are for people pointing a **root** domain at Fourthwall. **Do not add those** — they would break `bunchofothers.com` on GitHub Pages.
5. Add that CNAME at the registrar's DNS panel. Leave the existing GitHub Pages records alone.
6. **If the DNS is on Cloudflare**, set the record to **DNS only** (grey cloud, proxy off). Fourthwall does its own caching and DDoS protection, and proxying breaks their SSL issuance.
7. Return to Fourthwall and let it verify. Propagation is usually minutes but can take up to 48 hours. SSL is issued automatically once verification passes.

### 8. Publish (2 min)

1. Flip the five launch products from draft to **published**.
2. Set the **free shipping threshold to $75 USD** (Settings → Shipping).
3. Create the promo code **`FIRSTWAVE`**: 15% off, sitewide, limited to 50 uses, 14-day expiry (Settings/Marketing → Promo codes).
4. Publish the site.
5. Place a **$1-value test order on yourself** using a real card and the `FIRSTWAVE` code, to confirm the checkout flow, the CAD conversion, the confirmation email, and the shipping quote to a BC address. Cancel or keep it — either way you now know what a buyer sees.

### 9. Connect the platforms (5 min)

All under **Apps** / **Integrations** in the dashboard. TikTok Shop, Instagram Shopping, and YouTube Merch Shelf can all be connected simultaneously.

1. **Instagram / Meta Shopping** — the highest-value one for BOO; the band's audience is already there. Requires a Meta Business account linked to the `@bunch_of_others` Instagram.
2. **YouTube Merch Shelf** — puts products under the videos on `@BunchOfOthersMusic`. Note that YouTube gates the merch shelf behind Partner Program eligibility; if the channel isn't monetised yet, connect it anyway and it activates when eligibility lands.
3. **Spotify** — links the shop to the artist profile at the Spotify artist URL. Runs through Spotify for Artists.
4. Skip Twitch and TikTok Shop for now. Neither maps to how BOO reaches people, and each is another account to maintain.

### 10. Send Claude the following (2 min)

Paste these back into the session so the website integration can be wired:

- [ ] **Storefront URL** — the live shop address (`https://shop.bunchofothers.com`, or the `.fourthwall.com` one if DNS is still propagating)
- [ ] **Product URLs** — the full public link for each of the five launch products
- [ ] **Final prices in USD** for each, if any drifted from Section B
- [ ] **Product mockup images** — either download the mockups from each product page into `Images/merch/` (name them `merch-tee.webp`, `merch-tee-heavy.webp`, `merch-hoodie.webp`, `merch-hat.webp`, `merch-sticker.webp`) **or** just say "use the API" and the integration will pull them live
- [ ] **Storefront API token** — from **Settings → For Developers → Headless**. Optional; only needed for the live-data version of the integration. It is a public read-only token, safe to put in client-side code.
- [ ] **Confirmed base costs** for anything that differed from Section B, so the margin table can be corrected

**Sources checked 2026-09-06:** [Set up your custom domain](https://help.fourthwall.com/getting-started/setting-up-your-shop/get-started/set-up-your-custom-domain) · [Troubleshoot your domain and DNS records](https://fourthwallcreator.zendesk.com/hc/en-us/articles/15798008076955-Troubleshoot-Your-Domain-and-DNS-Records) · [Order samples](https://help.fourthwall.com/create-and-sell-products/how-to-guides/order-samples) · [Ordering samples guide](https://fourthwall.com/guides/ordering-samples) · [Platform integrations (TikTok, Instagram, YouTube)](https://help.fourthwall.com/manage-my-shop/apps-features-and-integrations/setting-up-platform-integrations) · [YouTube Merch Shelf](https://fourthwall.com/features/apps-and-integrations/youtube-merch-shelf) · [Storefront API (help centre)](https://help.fourthwall.com/manage-my-shop/apps-features-and-integrations/storefront-api-for-custom-storefronts)

---

## G. Website integration plan

*Short spec. A second agent implements this in `index.html`; this document does not touch it.*

**Current state.** `#merch` shows a `.coming-soon-banner` reading COMING SOON plus a `.coming-soon-sub` line pointing at Instagram. Behind that sits a `.merch-grid` of five `.merch-item` anchors with `href="PAYMENT_LINK_1..5"`, emoji placeholders, and placeholder names/prices (Band T-Shirt, Psychedelic Hat, Vinyl Record, Guitar Pick Set, Album CD). The grid is hidden by `#merch .merch-grid { display: none }` and revealed by `html.beta-pay`, which a synchronous head script sets when the URL carries `?beta=pay`. A DOMContentLoaded handler currently disables clicks on any `a[href^="PAYMENT_LINK_"]`.

**Target state.** Same five-card grid, real content:

| Card | Replaces | New content |
|---|---|---|
| 1 | Band T-Shirt | Classic Tee — $35 CAD — Fourthwall product URL |
| 2 | Psychedelic Hat | Heavyweight Tee — $44 CAD — Fourthwall product URL |
| 3 | Vinyl Record | Pullover Hoodie — $68 CAD — Fourthwall product URL |
| 4 | Guitar Pick Set | Dad Hat — $41 CAD — Fourthwall product URL |
| 5 | Album CD | Die-Cut Sticker — $10 CAD — Fourthwall product URL |

**Implementation notes for whoever picks this up:**

- Swap `.merch-image-placeholder` + `.placeholder-icon` emoji for a real `<img>` of the Fourthwall mockup, with `width`/`height`/`loading="lazy"`/`decoding="async"` per the V1_113 convention. Store the mockups as WebP under `Images/merch/`.
- Replace `PAYMENT_LINK_N` with the real product URLs. Once those are in, the `a[href^="PAYMENT_LINK_"]` click-blocker in the head script no longer matches anything and becomes dead code — remove it in the same pass.
- **Flip the gate** by deleting the `#merch .merch-grid { display: none }` default and the `html.beta-pay` reveal rules, then remove the COMING SOON banner and its sub-line. Keep the `?beta=pay` flag script only if it still gates something else; otherwise it goes too. There are `html.beta-pay .merch-grid` rules in several responsive blocks (roughly lines 2950, 7428, 7633, 7787) — all need the same treatment, and the mobile grid rules must survive.
- Add a sixth element or a footer link reading **"See all merch"** pointing at `https://shop.bunchofothers.com`. Five cards is the right number on the page; the shop carries the rest.
- **Vinyl and CDs come out of this grid entirely** and move to a Bandcamp link, per `PAYMENT_PLAN.md`. The current placeholders for both are misleading once a real shop exists.
- **Optional, later:** replace the hardcoded cards with a live fetch from the Storefront API — `GET https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=TOKEN`, returning names, images, variants, and prices as JSON. The token is a public read-only storefront token, safe in client-side code on a static GitHub Pages site. Cache the response in `sessionStorage` and render the hardcoded cards as the fallback if the fetch fails, so the section never renders empty. Do this only after the hardcoded version ships and is proven.

**Sources checked 2026-09-06:** [Storefront API overview](https://docs.fourthwall.com/storefront/overview) · [Storefront API getting started](https://docs.fourthwall.com/storefront/getting-started) · [Fetching products](https://docs.fourthwall.com/storefront/products) · [Embedding your store on an external website](https://help.fourthwall.com/manage-my-shop/shop-settings/embedding-your-store-on-an-external-website)

---

## H. Risks and open questions

### Confirmed risks

**1. Canadian buyers are "international" to Fourthwall's processor.** Card processing is 3.9% + $0.30 for non-US cards versus 2.9% + $0.30 domestic. For a band whose audience is mostly in BC, that is the standing rate, not the exception. It is baked into every margin in Section B. Nothing to do about it — just don't plan on the 2.9% number.

**2. Duties are the buyer's problem, and BOO will hear about it.** Most Fourthwall orders ship **Delivery Duty Unpaid**: the carrier may collect import fees on delivery, the amount is unpredictable, and Fourthwall shows a duty notice at checkout. A Canadian buying from a US-fulfilled facility can get a surprise bill. Fourthwall has fulfillment partners in **Canada** as well as the US, UK, EU, Mexico, Australia, and Japan, and the catalogue shows print/ship origin on product detail pages where it is known — **so during step 5 of the checklist, prefer the catalogue variant that fulfils from Canada if one exists for a given blank.** This is the single highest-leverage decision for Canadian customer satisfaction and it is invisible unless you look.

**3. Shipping cost to Canada is not published.** Fourthwall quotes dynamic carrier rates by package size and destination and says most items arrive in 5 to 8 days. **No figure for a shirt to BC could be confirmed.** The test order in checklist step 8 answers this in five minutes, and it needs to be answered before the price list is final — if shipping a $25 tee to Kelowna costs $15, the $75 free-shipping threshold is doing more work than assumed and may need to come down.

**4. No bulk discount for the merch table.** Catalogue print-on-demand carries no volume pricing; samples at cost is the cheapest route, and inventory levels can only be set on self-fulfilled products. For a real merch table, the economics still favour **screen printing 30 to 50 shirts locally in Kelowna** and listing them on Fourthwall as *self-fulfilled* products (or not listing them at all). Fourthwall also allows sending your own stock into its fulfillment centres, which is worth a look only if online volume justifies it. Recommendation: Fourthwall for online, local screen print for the table, same artwork on both.

**5. Trademark and band-name policy.** Fourthwall requires signed proof of authorisation for any third-party IP — logos, characters, brand names, photographs. **BOO's own logo and name are the band's own work, so nothing is needed at launch.** Two things to watch: (a) anything referencing Kyle's Fields of Green material would need whoever holds those rights to sign something — DMs and screenshots are explicitly not accepted; (b) the Curiosity cover art on the poster needs to be BOO-owned or licensed with the right to reproduce on merchandise. If the cover was made by an outside artist, get that in writing before the poster goes live.

**6. Sample quality is unresolved until a sample is in hand.** DTFx puts a thin (~0.1mm) film on the fabric with a slight sheen and a distinct hand versus DTG. On a black shirt with a bold white logo this is the right choice — DTG struggles with white ink on dark cotton — but it is a texture some people notice. Comfort Colors garment dye also varies between shirts. Both are expected behaviour, not defects, and neither is returnable under Fourthwall's made-to-order policy. Judge from a sample, not a mockup.

**7. Returns are narrow by design.** No returns for a change of mind or wrong size chosen at checkout; replacements only for verified damage, defect, or a wrong item shipped, claimed within 30 days of delivery. This is normal for print-on-demand and it is why the size/fit notes in Section E are written the way they are. Fourthwall's team handles the claim, but a bad size chart on the product page is BOO's problem.

**8. Vinyl and CDs stay on Bandcamp.** Fourthwall does not press records, and Bandcamp's cut plus its audience is better for physical music than a self-fulfilled listing here. `PAYMENT_PLAN.md` remains authoritative for that. The only change is that the site's merch grid stops advertising vinyl and CDs it cannot sell (Section G).

### Open questions for Kevin

| # | Question | Why it matters | Who answers |
|---|---|---|---|
| 1 | Does the Canada payout screen actually show **CAD**? | The Stripe Connect country determines it; documented but worth eyeballing | Kevin, checklist step 2 |
| 2 | What does shipping a tee to a Kelowna address actually cost? | Sets the free-shipping threshold and the honesty of the FAQ | Kevin, test order, step 8 |
| 3 | Exact **base cost and SKU** for the dad hat, beanie, and 18x24 poster | Three prices in Section B are estimates from "from" pricing | Kevin, in the designer, step 5 |
| 4 | Is there a **Canada-fulfilled** variant of the Bella+Canvas 3001 and the Gildan 18500? | Removes the duty surprise for the core audience | Kevin, product detail pages, step 5 |
| 5 | Who owns the **Curiosity cover art** reproduction rights? | Gates the poster SKU | Kevin |
| 6 | Screen-print locally for the merch table, or samples-at-cost? | Different economics, different lead times | Kevin's call |
| 7 | Price at the recommended column (~48%) or the 40% column? | Section C recommends the higher; it is a positioning choice | Kevin's call |
| 8 | Is a **"BOO Supporters" membership tier** wanted later? | 5% platform fee, separate build, not a launch item | Deferred |

**Sources checked 2026-09-06:** [Where products are printed and shipped from](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/where-products-are-printed-and-shipped) · [Shipping and delivery expectations](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/shipping-and-delivery-expectations) · [Community guidelines](https://help.fourthwall.com/frequently-asked-questions/legal-and-compliance/community-guidelines) · [Acceptable Use Policy](https://fourthwall.com/acceptable-use-policy) · [Terms of Service](https://fourthwall.com/legal/terms-of-service) · [DTFx printing technique](https://help.fourthwall.com/create-and-sell-products/printing-techniques/dtfx-printing-technique) · [What is direct-to-film (DTFx) printing?](https://fourthwall.com/blog/what-is-direct-to-film-printing) · [Sell your own products](https://help.fourthwall.com/create-and-sell-products/how-to-guides/sell-your-own-products) · [Returns, refunds & quality issues](https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/returns-refunds-and-quality-issues)

---

## Appendix: artwork specification

What the artwork agent needs to hit, so nothing gets rejected or printed soft. Confirmed 2026-09-06.

### Print files (DTFx and DTG)

| Requirement | Value |
|---|---|
| Format | **PNG with transparent background** |
| Resolution | **300 DPI minimum** |
| Recommended pixel size | **5000 x 5000 px** for DTG and DTFx |
| Colour profile | **CMYK** |
| Per-region files | Separate file for each print region: Front, Back, Left/Right Sleeve, Inside/Outside label |
| Safe area | Keep everything inside the dotted-line box the product designer overlays |

The planned `4500 x 5400 px` front files are **above the 300 DPI floor** for a standard ~12 x 16 in adult full-front area (12 in x 300 = 3600 px wide; 4500 px is comfortably over). They are slightly under the *recommended* 5000 x 5000 — fine in practice for a vector-sourced logo, but if the files are being generated from `boo-logo-white.svg` anyway, exporting at **5000 x 5000** costs nothing and matches Fourthwall's own recommendation exactly.

The `1200 px` left-chest files support roughly a 4 in placement at 300 DPI (4 x 300 = 1200), which is the standard left-chest width. Correct as specified, with no headroom — do not scale them up in the designer.

### Dark vs light garments

| Garment | Logo file | Why |
|---|---|---|
| Black tee / hoodie / crewneck / long sleeve | `boo-logo-white.svg` → `boo-logo-front-white-4500x5400.png` | DTFx lays opaque white on top of the fabric — the one thing DTG does badly |
| Comfort Colors Ivory tee | `boo-logo-black.svg` → `boo-logo-front-black-4500x5400.png` | Black on natural cotton; highest contrast available on a light garment |
| Natural tote | `boo-logo-front-black-4500x5400.png` | Same reasoning |

A one-colour logo is the ideal case for DTFx: no gradients to band, no halftones to muddy, no white underbase to misregister.

### Embroidery (dad hat, beanie)

Embroidery is the tightest constraint in the lineup. `boo-hat-embroidery.svg` must be a **simplified** version of the logo, not the print logo scaled down.

| Constraint | Limit |
|---|---|
| Minimum detail thickness | **0.05 in (4 pt)** — anything thinner cannot be stitched |
| Minimum spacing between elements | **0.05 in** |
| Minimum text height | **0.3 in** uppercase, **0.25 in** lowercase |
| Thread colours | **Up to 6**, chosen from a 15-colour palette |
| Stitch count | Under **15,000** for a standard ~4 x 4 in area; large-embroidery products allow up to 10 x 6 in with no fixed limit, though high-stitch designs may be flagged for review |
| 3D puff (if used) | All strokes between **0.2 in and 0.5 in** thick |

Practical guidance: solid shapes, bold strokes, one or two thread colours (white on black is the strongest and cheapest), symmetrical if possible so it centres cleanly on the panel. If any stroke in the BOO logo is thinner than 0.05 in at a 3 in stitch width, thicken it in the embroidery variant. Fourthwall digitises from the uploaded file; a design that violates the minimums comes back either rejected or as a lumpy approximation.

### Stickers

Die-cut vinyl at roughly 3 in. Supply `boo-sticker-diecut.png` as a transparent PNG at 300 DPI with a **clean silhouette** — the die follows the alpha edge, so stray semi-transparent pixels become a ragged cut. Add roughly 1/8 in of solid white border inside the cut line if the logo has thin extremities, so the vinyl has something to hold onto.

**Sources checked 2026-09-06:** [Design file guidelines and templates](https://help.fourthwall.com/create-and-sell-products/best-practices/design-file-guidelines-and-templates-for-merchandise) · [Artwork best practices](https://fourthwallcreator.zendesk.com/hc/en-us/articles/13331329584283-Artwork-best-practices) · [Embroidery best practices](https://help.fourthwall.com/create-and-sell-products/best-practices/embroidery-best-practices) · [DTFx printing technique](https://help.fourthwall.com/create-and-sell-products/printing-techniques/dtfx-printing-technique)
