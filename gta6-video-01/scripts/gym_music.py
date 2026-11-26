"""Two synthetic music stems for the leg-press video: a frantic one (focus on him) and a calm one (focus on her). Mixed in Remotion by camera focus."""
import json, sys, numpy as np, wave
from scipy.signal import butter, sosfilt
OUT = sys.argv[1]; sr = 24000; rng = np.random.default_rng(3)
D = json.load(open(f'{OUT}/src/macaque/lpsegments.json')); N = int((D['dur'] + 1.5) * sr)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=sr, output='sos'), x)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=sr, output='sos'), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'bandpass', fs=sr, output='sos'), x)
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def put(buf, t, sig, g=1.0):
    i = int(t * sr); sig = sig[:max(0, len(buf) - i)]; buf[i:i + len(sig)] += sig * g
def saw(f, d): x = np.arange(int(d * sr)) / sr; return ((x * f) % 1.0 - 0.5) * 2
def sq(f, d): return np.sign(np.sin(2 * np.pi * f * np.arange(int(d * sr)) / sr))
def env(n, a, dec): x = np.arange(n) / sr; return np.minimum(1, x / a) * np.exp(-x * dec)
# ---- frantic: 150 BPM, A minor driving bass, kick, hats, snare, plucky arp
F = np.zeros(N); step = 60 / 150 / 4
bass = [45, 45, 48, 45, 43, 45, 50, 48]   # A1 A1 C2 A1 G1 A1 D2 C2 (8th notes)
arp = [69, 72, 76, 81, 76, 72, 69, 72]
for k in range(int(D['dur'] / step) + 8):
    t = k * step
    if k % 2 == 0: b = bass[(k // 2) % 8]; put(F, t, lp(saw(hz(b), 0.19), 600) * env(int(0.19 * sr), 0.004, 9), 1.0)
    if k % 4 == 0: x = np.arange(int(0.16 * sr)) / sr; put(F, t, np.sin(2 * np.pi * (60 * np.exp(-x * 12) + 42) * x) * np.exp(-x * 14), 1.4)
    if k % 8 == 4: put(F, t, bp(rng.normal(0, 1, int(0.14 * sr)), 1500, 6000) * env(int(0.14 * sr), 0.002, 22), 0.9)
    put(F, t, hp(rng.normal(0, 1, int(0.04 * sr)), 7000) * env(int(0.04 * sr), 0.001, 60), 0.5 if k % 2 else 0.3)
    put(F, t, lp(sq(hz(arp[k % 8]), 0.09), 3500) * env(int(0.09 * sr), 0.002, 25), 0.22)
# ---- calm: 60 BPM, slow pads + music-box arpeggio with a soft echo
C = np.zeros(N); chords = [(57, 60, 64, 67), (53, 57, 60, 64), (48, 52, 55, 59), (55, 59, 62, 66)]
for k in range(int(D['dur'] / 4) + 2):
    t = k * 4.0; ch = chords[k % 4]; d = 4.6; n = int(d * sr); x = np.arange(n) / sr
    pad = sum(np.sin(2 * np.pi * hz(m) * x) + 0.3 * np.sin(2 * np.pi * 2 * hz(m) * x) for m in ch) * np.minimum(1, x / 1.2) * np.minimum(1, (d - x) / 1.5)
    put(C, t, pad * 0.25, 1.0)
    for j in range(8):
        m = ch[[0, 2, 1, 3, 2, 3, 1, 2][j]] + 12; dd = 1.2; xx = np.arange(int(dd * sr)) / sr
        put(C, t + j * 0.5, (np.sin(2 * np.pi * hz(m) * xx) + 0.35 * np.sin(2 * np.pi * 3 * hz(m) * xx)) * np.exp(-xx * 3.2), 0.5)
echo = np.zeros(N); d0 = int(0.37 * sr); echo[d0:] += C[:-d0] * 0.35; echo[2 * d0:] += C[:-2 * d0] * 0.15; C += echo
def save(a, name, rms):
    a = a * (rms / np.sqrt(np.mean(a[abs(a) > 1e-4] ** 2))); a = np.clip(a, -0.95, 0.95)
    w = wave.open(f'{OUT}/public/audio/{name}', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype('<i2').tobytes()); w.close()
save(F, 'lp_music_frantic.wav', 0.05); save(C, 'lp_music_calm.wav', 0.045)
print('ok')
