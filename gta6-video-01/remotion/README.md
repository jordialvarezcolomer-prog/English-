# GTA VI — "6 things" (Remotion)

1080×1920 · 30 fps · 77 s · `GTA6Facts` composition.

```bash
npm install
npm run studio     # preview
npm run render     # -> out/gta6-facts.mp4
```

## Structure
- `src/timeline.ts` — scene boundaries (seconds) and **ASSETS** (voice, music, sfx, per-scene clips).
- `src/scenes/*` — one file per fact (scene = background layer + typography overlay).
- `src/components/` — `KineticText`, `Fx` (shake/flash/whip/number badge), `SubtitleTrack`, `ClipSlot`, `AudioController`.
- `src/captions.json` — caption chunks (seconds). Currently ESTIMATED from the script; replace with real word timestamps once the narration exists.

## Plugging in real material
- Footage: put MP4s in `public/clips/` and set `ASSETS.clips.<jetski|events|social|house|theft|games>` in `timeline.ts`. `ClipSlot` then plays them behind the overlay instead of the illustrative motion graphics. Nothing is presented as gameplay unless footage is supplied.
- Voice: put `public/audio/voice.mp3`, set `ASSETS.voice`, then update `SCENES` and `captions.json` with the measured times. Music is auto-ducked (×0.28 ≈ −11 dB) when a voice is set.
- `public/audio/music.wav` and `sfx.wav` are synthesized placeholders (drone + pulse, whooshes, impacts); swap for licensed tracks if desired.
