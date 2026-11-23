# TEAL — Character Bible (phase 1, v0.1)

Silent visual coach of the British-English fitness/biomechanics channel. Built from the owner's reference image (teal comic-style bodybuilder doing a rope triceps pushdown).

## 1. Reference analysis
- **Skin**: single deep teal, colour measured on the reference: base `#2B6362`, with cel bands from `#07191A` (deep shadow) to `#6BB8B0` (specular). ~5–6 hard bands, no gradients.
- **Head**: bald, smooth, ovoid, no ears, no nose, no mouth; strong brow ridge; two narrow angular white eye slits (no pupils). Reads as "masked", determined.
- **Body**: pro-bodybuilder V-taper — huge traps/delts/lats, thick neck, separated pecs, 6-pack with visible obliques, big quads with teardrop, diamond calves.
- **Clothing**: loose black shorts, thin white waistband, white crew socks, white (or black) gym shoes.
- **Rendering**: clean black outline, hard cel-shading, light from upper-left, rim shadow on the side facing away from light, illustrated (not plastic) look.
- Reference extras NOT in the brief (kept out until the owner confirms): brown cross necklace, small red mark near the eye, rope attachment with black knobs (the rope IS used as an exercise prop).

## 2. Palette (HEX)
| Use | Ramp (shadow → light) |
|---|---|
| Skin | `#07191A` `#12302F` `#1C4745` **`#2B6362`** `#3A8280` `#6BB8B0` |
| Shorts | `#050506` `#0C0C0E` `#16161A` `#212126` `#34343C` `#5E5E6B` |
| White (waistband, socks, shoes) | `#7D8887` `#A9B5B4` `#D2DAD9` `#EBF1F0` `#F7FAF9` `#FFFFFF` |
| Eyes | `#F6FFFD` (shape), `#050607` (eye outline) |
| Outline | `#050607`, constant on-screen width (~0.4 % of frame) |
| Muscle highlight | `#FFB02E` amber (glow shader keeps the cel bands) |
| Machine metal | `#2C2F36` → `#D3D8DF` |
| Rope / grips | `#020202` → `#4A4A52` |

## 3. Proportions (metres, standing, 1.98 m tall)
Head 0.26 · neck 0.17 · shoulder width 0.57 (delt to delt ≈ 0.68) · waist ≈ 0.33 · hip ≈ 0.45 · upper arm 0.32 · forearm 0.26 · hand 0.12 · thigh 0.46 · shin 0.46. Chest:waist ratio ≈ 1.8:1 (strong V). Never change these numbers — they live in `src/hero/Hero.ts`.

## 4. Face rules (updated v1 — owner asked for a humanised face)
Human face on the teal head: sculpted nose, lips with a firm mouth line, ears, heavy brow ridge, real eyes in carved sockets (white sclera, teal iris `#1F7A76`/`#3FB0A8`, black pupil, catch-light) with heavy upper lids. Expression = determined, focused (brows sloping toward the nose, firm closed mouth). Bald, no hair/eyebrows drawn as hair. Comic ink lines (mouth, nostrils, eyelid creases, nasolabial folds, jaw) are drawn on top of the sculpted surface.

## 4b. Textures (all procedural, identical every video)
Skin: pore grain, halftone dots in shadow transitions, comic hatching in the darkest band, veins on forearms/biceps/triceps (strongest on forearms), muscle-separation ink lines from the sculpted grooves. Shorts: woven fabric + vertical drape folds. Socks/waistband: knit ribs. Soles: tread. Rope: black twisted.

## 5. Lighting & shading rules
Light fixed in **view space** (upper-left, slightly in front) so shading is identical from every camera angle; 6 hard bands; one specular dot band; outline always on. Muscle highlight = amber tint on that muscle's own mesh; no extra glows on the rest of the body.

## 6. Rules that never change
1. Same rig, same proportions, same palette in every video.
2. Never a mouth/nose/ears/hair. 3. Shorts black with white waistband; socks white. 4. Amber is the only highlight colour. 5. Outline never disappears. 6. Biomechanics first: arms/joints move only as they do in the real exercise (e.g. pushdown: upper arms fixed, elbow flexion only). 7. Hands wrap handles properly.

## 7. Muscle groups that can be lit individually
delt_front, delt_side, delt_rear, pecs, lats, traps, abs, obliques, biceps, triceps, forearms, quads, hams, glutes, calves (`src/hero/Hero.ts → MUSCLES`).
