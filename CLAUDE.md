# Project notes for Claude

## Video production (standing instructions from the owner)
- **Every video** must follow `gta6-video-01/docs/RETENTION_MASTER.md` (retention/viral-storytelling master instruction). Produce the written production plan (A–G) before building and audit the rendered video before delivering.
- Fitness series style = flat outlined cartoon like `gta6-video-01/remotion/src/gym/` (kit.tsx), characters Alex (blue shirt, dark short hair, headphones) and Daniel (red shirt, red mohawk, black beard). Captions: black bars, spoken words white / upcoming grey.
- Scientific claims: cite sources on screen, label illustrative graphics, never invent numbers.
- Free TTS fallback when ElevenLabs credits are exhausted: Kokoro (`kokoro-onnx`, voice `am_michael`, model files from GitHub releases `thewh1teagle/kokoro-onnx`).

## Owner preferences learned while making videos (apply to every video)
- No stray shapes on characters (e.g. a green pocket rectangle on Alex's hoodie was removed); every drawn element must clearly mean something.
- Hands must grip handles correctly (fingers wrap the bar, back of hand on the far side); arms stay straight where the real exercise is straight; elbows never bend unrealistically.
- Highlight overlays (e.g. muscle glow) are small, hug the muscle, and only appear when it is working.
- Videos must hit their minimum duration (usually ≥60 s) without silent stretches: no dead ending, add narration/animation instead of holding still.
- Hook: the first frame already shows the action; zoom in on each option as it is named, then pull the camera back.
- On-screen source footers (e.g. "McKenzie et al.") are NOT wanted on the dips video; keep sources in the plan docs / caption instead.
- Narrator: natural voice, not robotic; sound effects quiet (well below the voice); music very low.

## Dynamic-video rules (approved by the owner on the macaque/couple videos; apply to ALL videos, gym included)
- **Pipeline**: owner pastes the script (ask for CAPS on stressed words + `!` / `...` for pauses, TTS-generator ready) -> owner generates the audio (ttsmaker, in parts) -> I verify order/content (pocketsphinx offline: `pip install pocketsphinx`, no model download needed; `faster-whisper` models are blocked by the proxy) -> build the timeline from the real audio. Ignore stray files in the zip (e.g. `lewis.wav`) unless told otherwise.
- **Audio assembly**: join the parts, shorten pauses by silence detection (inside a sentence ~0.12 s, between sentences ~0.17 s, lead-in 0.05 s so the voice starts at 0 s), keep longer gaps (~0.55 s) where a sound gag needs room; then light speed-up 1.04-1.06x with `atempo` (never more, must not sound robotic). Final target >=75 s if the owner asks, otherwise >=60 s. Scripts: `gta6-video-01/scripts/couple_voice.py` (assembly + `cpsegments.json` with sentence + named event times), `couple_sfx.py`, `couple_music.py`.
- **Timeline is data-driven**: sentence/event times from the json drive camera keys, expressions, stamps, SFX and music; never hardcode times.
- **Retention toolkit** (use constantly): first frame = action already moving, pull-back at ~0.5 s; camera punch-in on every key word/number then back to a shot of the whole scene; a new shot/cutaway every 2-4 s; screen shake + camera shake proportional to the action; big pop-in stickers ("ATTEMPT #n", "WHAM!", "NOPE."); on-screen counters/meters with a creative shape (cracking heart, tally marks, thermometer) labelled "made-up numbers, just a joke"; white flash on hard cuts; vignette + speed lines when intensity rises; sparkles/steam/particles; end with a share call-to-action pill and a payoff gag.
- **Camera**: always clamp the camera centre so the view never leaves the canvas (no black bars): `cx in [540/z, 1080-540/z]`, same for y.
- **Sound design**: an SFX for every visible action (thumps on bounces, whooshes on cuts, ticks, chalk scratch for tallies, dings for meters, alarm beeps, heartbeat + riser for tension, glass crack for failures); SFX bus volume ~0.3, voice always on top; character mumbles as a separate quiet track (~0.45). Generate everything with numpy/scipy (no downloads).
- **Music**: two synthetic stems mixed live by camera focus with `Audio volume={(frame)=>...}`: a frantic stem (~150 BPM) when the camera is on the agitated character / climax, a calm stem (slow pads + music-box) on the calm character / ending; smooth the weight over +-0.3 s; music ~14 dB below the voice. For gym videos use the same idea: intense stem during the set, calm stem during rest / explanation.
- **QC before delivering**: contact sheet of ~36 frames over the whole timeline + stills right after every fix, `volumedetect` on the final mix, `loudnorm=I=-16`, re-encode for sending (libx264 crf 24, ~35 MB). Say honestly that the video was checked by stills/levels, not watched.
- **Copyright note**: look-alikes of Disney/Pixar characters (e.g. the red race car) are drawn by me, simplified and without logos; always warn the owner about possible claims.

## Lessons from the leg-press video (owner feedback; apply to ALL videos, especially gym)
- **Use REAL equipment/exercises only**: draw machines the way they exist in a gym (e.g. 45-degree sled leg press vs flat seated leg press). Never invent a variant. If unsure, look up the real machine before drawing.
- **No permanent split-screen.** Split-screen only for the hook and 1-2 short comparison beats. Otherwise change shot every 2-3 s: solo close-ups, detail inserts, diagrams (angle arcs, spine, muscle maps), floor plans, "other examples", celebratory finale.
- **Reps fast** (about 1 s per rep), athletes **sweat** (drops + sweat spray), strain faces at the bottom of each rep.
- **Hook**: both subjects visibly doing the action from frame 0; the title sits in its own band ABOVE the action and never covers the exercise; punch-in on each option as it is named, then pull back.
- **Labels/names must fit** (auto-size chips, keep them in screen space, never clip them at the edge when the camera zooms).
- **SVG diagrams need an `<svg>` wrapper** when placed inside an HTML stage (blank shots otherwise).
- **Review before sending**: render stills of EVERY shot (mid-point + extra frames), read the contact sheets, fix, then render. Say honestly what was checked.
