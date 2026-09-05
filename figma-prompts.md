# Figma Prompts — แอปต่อคิวโรงอาหาร ม.เกษตร ศรีราชา

ใช้กับ Figma Make / Figma AI — ส่งทีละ prompt (อย่ารวมเป็นอันเดียว ผลลัพธ์จะเละ)

---

## Prompt 0 — Design System (ส่งอันนี้ก่อน)

Create a design system page for a Thai university food-court queue app.
Name it "Queue Design System". Frame size 1440x1024, light background #FAF9F7.

TYPOGRAPHY
- Thai UI font: "IBM Plex Sans Thai" (fallback Noto Sans Thai)
- Numerals / queue numbers: "IBM Plex Mono" Bold — tabular, unambiguous
- Scale: Display 128 / H1 40 / H2 28 / Body 17 / Caption 14
- Minimum body size 17px. This app is used one-handed, walking, in a noisy hall.

COLOR
- Ink #14161A, Paper #FAF9F7, Muted #6B7280, Line #E5E3DF
- Status: Waiting #F59E0B, Cooking #3B82F6, Ready #10B981, Unpaid #EF4444

TICKET IDENTITY SYSTEM (the most important part)
Create 8 "ticket identity" swatches. Each identity = ONE COLOR + ONE SHAPE,
never color alone (must work for colorblind users and in bright sunlight):
1. Mango #F5A524 + circle
2. Chili #E5484D + triangle
3. Grass #46A758 + square
4. Sky #0090FF + star
5. Grape #8E4EC6 + hexagon
6. Coral #F76808 + droplet
7. Teal #12A594 + cross
8. Cocoa #7C5C42 + heart
Show each as a 200x200 card: solid color fill, white shape icon top-left,
white 3-digit number in IBM Plex Mono Bold 96 centered.
Consecutive queue numbers must never receive the same identity.

COMPONENTS
Buttons (height 56, radius 12, full-width primary), status pills,
order row, queue chip, toast/notification banner, bottom sheet.
Minimum tap target 56x56 — vendors tap this with wet or oily hands.

Draw all icons as flat line SVG, 24px grid, 2px stroke. No emoji.

---

## Prompt 1 — Customer App (7 screens)

Design 7 mobile screens, 390x844 each, laid out in one row with 120px gaps.
Use the "Queue Design System" above. All UI copy in Thai, exactly as given.
Do NOT draw a fake iOS status bar or fake keyboard.

Screen 1 — "เลือกร้าน"
Header "โรงอาหารกลาง". A vertical list of 6 food stall cards.
Each card: stall name (H2), current wait ("รอ ~12 นาที · 8 คิว"),
a thin horizontal bar showing how busy it is, and a small photo thumbnail.
Bottom tab bar: หน้าแรก / คิวของฉัน / ประวัติ.

Screen 2 — "ร้านป้าน้อย ข้าวแกง"
Menu list grouped by category. Each item row: name, price, stepper (- 1 +).
Under popular items show a subtle chip "กำลังทำอยู่ 5 จาน — ได้เร็ว".
Sticky bottom bar: "ตะกร้า 2 รายการ · ฿90" primary button.

Screen 3 — "ยืนยันออเดอร์"
Order summary. Below it a section "ตัวเลือกพิเศษ" with toggle chips:
ไม่เผ็ด / เผ็ดน้อย / ไม่ใส่ผัก / ข้าวเพิ่ม / ไข่ดาว.
Warning banner in amber: "ออเดอร์พิเศษอาจใช้เวลานานกว่าปกติ 2-3 นาที".
Payment method as two large selectable cards side by side:
"สแกนจ่าย — เข้าคิวทันที" (selected state) and
"เงินสด — ต้องจ่ายที่ร้านก่อนเข้าคิว".
Primary button: "ยืนยันและรับคิว".

Screen 4 — "บัตรคิว" (HERO SCREEN — make this the most striking)
Full-bleed solid color background (use Mango #F5A524).
Large white shape icon (circle) top-left, 64px.
Queue number "032" in IBM Plex Mono Bold, 220px, pure white, centered.
Below: "ร้านป้าน้อย" and "กะเพราหมู ไข่ดาว" in white 20px.
Below that: "อีก 4 คิวถึงคุณ" and "ประมาณ 9 นาที".
A horizontal row of 6 small dots showing queue position progress.
Bottom: white outlined button "ยกเลิกออเดอร์".
This screen must be readable from 2 metres away.

Screen 5 — "เตรียมตัว" (notification state)
Same full-bleed ticket, but a white banner slides in from the top:
"🔔 อีก 2 คิวถึงคุณแล้ว — เดินมารอที่ร้านได้เลย"
Show the lock-screen push notification version of this above the frame too.

Screen 6 — "รับได้แล้ว" (the handoff screen)
Full-bleed color, but now with a thick white 12px border pulsing inward.
Top strip in white: "แสดงหน้าจอนี้ให้แม่ค้าดู".
Number "032" at 260px. The shape icon enlarged to 120px next to it.
Under it a white pill: "กะเพราหมู ไข่ดาว · ไม่เผ็ด" (special options in bold).
Bottom: large white button "รับอาหารแล้ว".
The whole screen is designed to be held up and glanced at, nothing else.

Screen 7 — "เงินสด — รอชำระ"
Ticket in grey #6B7280 instead of a color, with a red banner:
"ยังไม่เข้าคิว — จ่ายเงินที่ร้านก่อน".
Big text "฿90" and "แจ้งแม่ค้าว่าจ่ายเงินสด".
Make it visually obvious this ticket is INACTIVE compared to screen 4.

---

## Prompt 2 — Vendor App (5 screens)

Design 5 mobile screens, 390x844, one row, 120px gaps.
Same design system. Thai copy exactly as given. This is used by a busy
vendor holding a spatula — every action must be ONE large tap.
Do NOT draw a fake status bar.

Screen 1 — "คิววันนี้" (main cooking queue)
Header: "ร้านป้าน้อย" + a live counter "12 คิวรอ".
The list is GROUPED BY MENU ITEM, not one row per order — this is the key idea:
  Card A: "กะเพราหมู  x3" in H1, below it three small identity chips
          (colored circle+shape+number): 031, 032, 035.
          Big green button across the card: "เสร็จ 1 จาน".
  Card B: "ข้าวมันไก่  x2" — chips 033, 037 — same button.
  Card C: "ผัดซีอิ๊ว  x1  ⚠ ไม่เผ็ด" — dark card with amber left edge,
          single chip 034, button "เสร็จแล้ว".
Special / non-standard orders always render as their own card, never grouped.

Screen 2 — "ส่งมอบ" (handoff confirmation sheet)
A bottom sheet over screen 1, triggered by tapping "เสร็จ 1 จาน".
The sheet is filled with the NEXT customer's identity color (Mango).
Huge "032" + shape icon. Text: "เรียกคิวนี้ — ให้ลูกค้าโชว์หน้าจอสีเดียวกัน".
Two buttons: "ส่งมอบแล้ว" (white, large) and "ยังไม่มารับ — ข้ามไปก่อน" (text).
A small speaker icon with label "กำลังประกาศเสียง: คิวสามสิบสอง".

Screen 3 — "รอรับเงินสด"
A filtered list of grey/inactive tickets. Each row: queue number in grey,
menu, amount "฿90", and a red pill "รอเงินสด".
Each row has one wide button: "รับเงินแล้ว — เข้าคิว".
Empty state variant: "ไม่มีคิวรอชำระ".

Screen 4 — "ออเดอร์พิเศษ"
A focused view of only the non-standard orders, dark theme,
so the vendor can double-check before serving.
Each card: queue identity, menu name, and the modifications listed
in large amber text: "ไม่เผ็ด", "ไม่ใส่ผัก".

Screen 5 — "สรุปวันนี้"
Simple stats: ยอดขาย ฿4,280 / 47 ออเดอร์ / เวลารอเฉลี่ย 8 นาที.
A bar chart of orders per hour. A list of best sellers.
Keep it minimal — this is the least important screen.

---

## Prompt 3 — Flow diagram (ทำทีหลังถ้าอยากได้)

Create a flow diagram frame 1920x1080 showing the order lifecycle as
connected nodes with labelled arrows:
รอชำระ → ชำระแล้ว/เข้าคิว → กำลังทำ → รับได้ → รับแล้ว
Branch from รอชำระ: "ยกเลิกอัตโนมัติใน 5 นาที".
Branch from รับได้: "ไม่มารับ → ข้ามคิว → กลับเข้าคิวท้ายแถว".
Annotate where each of the two push notifications fires.

---

## Prompt 4 — MASTER PROMPT (สร้างทั้งแอปรวดเดียว)

ใช้กับ Figma Make / v0 / Lovable / Bolt / Claude — ส่งก้อนเดียวจบ

Build a complete, working mobile web app prototype called "ต่อคิว" (TorQueue) —
a food-court queue and ordering app for Kasetsart University Sriracha Campus.
All UI copy in Thai. Mobile-first, 390px viewport. Make it feel like a real
shipped product, not a wireframe.

## THE PROBLEM IT SOLVES
Students queue so long at the campus food court that the line reaches into the
seating area and people stand between dining tables. This app lets them order
and pay from their phone, then wait at a table until their food is ready.

## THE HARD CONSTRAINT
Vendors get NO extra hardware. No queue display, no receipt printer, no number
tags, no buzzers. One phone (the one they already own) plus the customers'
phones is the entire system. Every solution must be pure software.

## THE CORE DESIGN INSIGHT — build everything around this
When five people order the identical dish, the plates are interchangeable. It
does not matter which physical plate anyone gets — only WHOSE TURN it is. So the
app never tracks plates; it tracks handoff order. Two consequences:

1. Identical orders are BATCHED for the vendor. The vendor screen shows
   "กะเพราหมู x3" as one card with one button, not three separate rows. This is
   also faster to cook, which is why vendors will actually adopt the app.

2. Non-standard orders (ไม่เผ็ด, ไม่ใส่ผัก, พิเศษ) are the only ones that truly
   cannot be swapped. These NEVER get batched — they always render as their own
   card with a dark background and an amber warning edge.

Identification at the counter is solved by TIMING, not by labels: notify the
customer to walk over BEFORE the food is done, so the plate goes hand-to-hand
straight off the pan and never sits on a shelf next to identical plates.

## TICKET IDENTITY SYSTEM
Every order gets a visual identity = ONE COLOUR + ONE SHAPE (never colour alone
— 8% of men are colourblind, and the food court is brightly lit).
Rotate through 8, never repeating on consecutive numbers:
  Mango #F5A524 circle · Chili #E5484D triangle · Grass #46A758 square
  Sky #0090FF star · Grape #8E4EC6 hexagon · Coral #F76808 droplet
  Teal #12A594 cross · Cocoa #7C5C42 heart
The customer holds up a full-bleed screen in that colour with a giant number.
The vendor's handoff sheet shows the same colour and shape. Matching is instant
and needs no reading.

## APP STRUCTURE
A role switcher in a floating dev-tools pill lets the demo toggle between
"👤 ลูกค้า" and "🍳 ร้านค้า" so both sides can be shown from one prototype.

### CUSTOMER SIDE
1. เลือกร้าน — list of 6 stalls, each with live wait time ("รอ ~12 นาที · 8 คิว")
   and a busy-ness bar. Bottom tabs: หน้าแรก / คิวของฉัน / ประวัติ.
2. เมนูร้าน — items with steppers. Popular items show "กำลังทำอยู่ 5 จาน — ได้เร็ว".
   Sticky cart bar.
3. ยืนยันออเดอร์ — order summary; special-option chips (ไม่เผ็ด / เผ็ดน้อย /
   ไม่ใส่ผัก / ข้าวเพิ่ม / ไข่ดาว); amber warning "ออเดอร์พิเศษอาจใช้เวลานานกว่าปกติ
   2-3 นาที"; two big payment cards — "สแกนจ่าย — เข้าคิวทันที" and
   "เงินสด — ต้องจ่ายที่ร้านก่อนเข้าคิว".
4. บัตรคิว — HERO SCREEN. Full-bleed identity colour, shape icon 64px top-left,
   queue number in monospace bold at 220px pure white, dish name, "อีก 4 คิวถึงคุณ
   · ประมาณ 9 นาที", a progress dot row. Readable from 2 metres.
5. เตรียมตัว — same ticket with a white banner sliding down:
   "🔔 อีก 2 คิวถึงคุณแล้ว — เดินมารอที่ร้านได้เลย"
6. รับได้แล้ว — full-bleed colour with a pulsing white 12px inner border,
   number at 260px, shape icon at 120px, top strip "แสดงหน้าจอนี้ให้แม่ค้าดู",
   a white pill listing special options in bold, button "รับอาหารแล้ว".
   Nothing else on this screen. Its only job is to be held up.
7. เงินสด — รอชำระ — the SAME ticket rendered in dead grey #6B7280 with a red
   banner "ยังไม่เข้าคิว — จ่ายเงินที่ร้านก่อน". Must look obviously inactive.

### VENDOR SIDE
1. คิววันนี้ — grouped cooking queue as described above. Header shows live
   "12 คิวรอ". Each grouped card has one wide green button "เสร็จ 1 จาน".
2. ส่งมอบ — a bottom sheet filled with the next customer's identity colour,
   giant number + shape, "เรียกคิวนี้ — ให้ลูกค้าโชว์หน้าจอสีเดียวกัน",
   buttons "ส่งมอบแล้ว" and "ยังไม่มารับ — ข้ามไปก่อน",
   plus a speaker line "กำลังประกาศเสียง: คิวสามสิบสอง" (use the Web Speech API
   to actually speak the Thai queue number aloud — this replaces a queue display
   using only the phone the vendor already has).
3. รอรับเงินสด — grey inactive tickets, each with "รับเงินแล้ว — เข้าคิว".
   Cash orders do NOT enter the cooking queue until this is tapped.
4. ออเดอร์พิเศษ — dark-theme review list of non-standard orders only,
   modifications in large amber text.
5. สรุปวันนี้ — ยอดขาย ฿4,280 / 47 ออเดอร์ / เวลารอเฉลี่ย 8 นาที, bar chart by
   hour, best sellers. Keep minimal.

## ORDER STATE MACHINE — implement this for real
รอชำระ → ชำระแล้ว/เข้าคิว → กำลังทำ → รับได้ → รับแล้ว
- Cash orders start at รอชำระ and auto-cancel after 5 minutes unpaid.
- QR orders skip straight to เข้าคิว.
- "ยังไม่มารับ" moves an order back to the end of the queue, once only.
- The เตรียมตัว notification fires when 2 orders remain ahead.
- The รับได้ notification fires when the vendor taps เสร็จ.
Wire the two sides to shared state so tapping "เสร็จ 1 จาน" on the vendor screen
visibly updates the customer ticket. That live link is the whole demo.

## DESIGN SYSTEM
- Thai UI font "IBM Plex Sans Thai"; numerals "IBM Plex Mono" Bold (tabular)
- Ink #14161A · Paper #FAF9F7 · Muted #6B7280 · Line #E5E3DF
- Status: Waiting #F59E0B · Cooking #3B82F6 · Ready #10B981 · Unpaid #EF4444
- Body never below 17px; every tap target at least 56x56 (vendors have oily hands)
- Flat line SVG icons on a 24px grid, 2px stroke. No emoji in the UI itself.
- No fake iOS status bar and no fake keyboard — the real ones render on top.
- Restrained motion: one confident transition per state change, no bouncing.

## SEED DATA
Six stalls: ร้านป้าน้อย ข้าวแกง · ครัวคุณยาย · ข้าวมันไก่เจ๊หมวย · ก๋วยเตี๋ยวลุงชาญ ·
อาหารตามสั่งพี่เบิร์ด · ส้มตำแซ่บนัว.
Dishes: กะเพราหมูไข่ดาว ฿50, ข้าวมันไก่ ฿45, ผัดซีอิ๊ว ฿45, ข้าวหมูกรอบ ฿55,
ก๋วยเตี๋ยวต้มยำ ฿50, ส้มตำไทย ฿40.
Pre-populate the vendor queue with 12 live orders so the batching is visible
immediately — including at least two special orders and one unpaid cash order.
