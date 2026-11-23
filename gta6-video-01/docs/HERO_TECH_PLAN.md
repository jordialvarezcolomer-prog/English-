# TEAL — technical plan (why a procedural 3D rig)

## Options evaluated
| Option | Identity consistency | Motion quality | Camera freedom (front/side/back/3-4/close-up) | Cost / control | Verdict |
|---|---|---|---|---|---|
| AI still images per shot | Poor — the model re-invents the character every generation | none (stills) | Poor | credits per image | ✗ as main system; fine for thumbnails |
| AI image-to-video | Drifts after a few seconds, hands/gear break, no biomechanics control | Plausible but not exact | Limited | expensive, unpredictable | ✗ for teaching exercises |
| 2D sprite sheets | Perfect for the angles drawn | Needs a sheet per exercise × angle (hundreds) | Fixed angles only | huge art effort | ✗ |
| 2D skeletal (puppet) | Good | Good but cannot rotate to back/3-4 | Only the drawn view | medium | ✗ for orbit shots |
| **Procedural 3D rig in Remotion/three.js (chosen)** | **Exact — one model, geometry + palette in code** | **Exact joint control → real biomechanics** | **Any angle, orbit, push-in, close-up** | free, deterministic, renders in Remotion | ✓ |
| Imported GLB (Mixamo etc.) | Good | Mixamo clips are generic, not exercise-accurate | Any | needs an external model | Optional upgrade: hand-sculpted GLB with the SAME skeleton/names |

## How identity is guaranteed
- One builder `buildHero()` creates every video's character. Palette, proportions and eyes are constants.
- Cel-shading + inverted-hull outline shaders (`src/hero/toon.ts`) are shared by hero and equipment, so the look is identical from every camera.
- Poses are numeric joint angles (`src/hero/poses.ts`), so each exercise is a small function (e.g. `pushdown(elbowAngle)`) and mistakes ("elbows flaring", "swinging torso") are just other angles.
- Individual muscle meshes allow highlight without touching the rest of the character.
- Consistency test: `HeroSheet` composition renders 8 poses/cameras from the same rig (`out/hero/consistency_sheet.png`).

## v1 update
The primitive mannequin was replaced by an implicit-surface sculpt (≈230 anatomical blobs → smooth-union field → Surface Nets mesh, 6.8 mm voxels) skinned to the same rig, with groove lines, comic cel shader, face carving and procedural textures (`src/hero/Sculpt.ts`, `Hero.ts`, `toon.ts`).

## Known limits of v0.1 (honest)
The procedural body is a clean, consistent mannequin-style bodybuilder — it does NOT yet match the reference's painted anatomy detail (muscle separation lines, vein/skin texture, hand detail). Upgrade path, in order: (1) add shape keys/detail meshes + hatch texture per muscle; (2) replace the primitives by a sculpted GLB (Blender) skinned to the same bone names, keeping the shaders; (3) optional AI-painted hero key art for thumbnails/title cards only.

## Next steps after the owner approves the look
1. Decide the open items in the Bible (necklace? eye mark?). 2. Raise anatomical detail. 3. Build the exercise library (pushdown, lateral raise, lat pulldown, curls, RDL…) as pose functions with camera presets. 4. Pilot video.
