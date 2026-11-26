"""Synthesise quiet SFX, her sleepy mumbles and a very low music bed for the couple video, timed from lpsegments.json."""
import json, sys, numpy as np, wave
from scipy.signal import butter, lfilter, sosfilt
OUT = sys.argv[1]
sr = 24000; rng = np.random.default_rng(7)
D = json.load(open(f'{OUT}/src/macaque/lpsegments.json')); EV = D['events']; SEG = D['segs']; N = int((D['dur'] + 1.5) * sr)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=sr, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=sr, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=sr, output='sos'), x)
def t_(d): return np.arange(int(d * sr)) / sr
def env(n, a=0.01, r=0.1):
    e = np.ones(n); na, nr = int(a * sr), int(r * sr)
    e[:na] = np.linspace(0, 1, na); e[-nr:] = np.minimum(e[-nr:], np.linspace(1, 0, nr)); return e
def thump(f0=95, d=0.16): x = t_(d); return np.sin(2 * np.pi * (f0 * np.exp(-x * 9) + 38) * x) * np.exp(-x * 22)
def noise(d): return rng.normal(0, 1, int(d * sr))
def whoosh(d=0.45, lo=300, hi=3000, up=True):
    x = noise(d); n = len(x); out = np.zeros(n)
    for i in range(0, n, 480):
        k = i / n; c = (lo + (hi - lo) * (k if up else 1 - k)); seg = x[i:i + 480]
        out[i:i + 480] = bp(np.concatenate([x[max(0, i - 480):i], seg]), max(50, c * 0.6), min(sr / 2 - 100, c * 1.4))[-len(seg):]
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.6
def ding(f=880, d=0.5): x = t_(d); return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x * 7) * 0.6
def tick(): x = t_(0.03); return noise(0.03) * np.exp(-x * 150) * 0.7
def chalk(): return np.concatenate([hp(noise(0.06), 2500) * np.hanning(int(0.06 * sr)) * 0.5, np.zeros(int(0.03 * sr))] * 3)
def snore(d=0.9, g=1.0):
    n = int(d * sr); x = lp(noise(d), 380) * (0.5 + 0.5 * np.sin(2 * np.pi * 45 * t_(d))); return x * np.sin(np.linspace(0, np.pi, n)) ** 1.2 * g
def breath(d=0.9, lo=500, hi=3500): return bp(noise(d), lo, hi) * np.sin(np.linspace(0, np.pi, int(d * sr))) ** 1.5 * 0.7
def glasscrack(): x = t_(0.35); return (hp(noise(0.35), 3000) * np.exp(-x * 14) + 0.5 * np.sin(2 * np.pi * 2600 * x) * np.exp(-x * 30)) * 0.8
def boing(): x = t_(0.5); f = 220 + 160 * np.sin(2 * np.pi * 5 * x) * np.exp(-x * 4); return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-x * 5) * 0.6
def beep(f=1400): x = t_(0.11); return np.sign(np.sin(2 * np.pi * f * x)) * 0.35 * env(len(x), 0.005, 0.02)
def heartbeat(): return np.concatenate([thump(70, 0.12), np.zeros(int(0.1 * sr)), thump(60, 0.12) * 0.7])
def spooky(): x = t_(0.9); return np.sin(2 * np.pi * np.cumsum(260 + 18 * np.sin(2 * np.pi * 6 * x)) / sr) * np.sin(np.pi * x / 0.9) * 0.35
def chime(f): x = t_(0.7); return (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * 3 * f * x)) * np.exp(-x * 4) * 0.45
def mumble(d=0.8, f0=190):
    n = int(d * sr); x = np.arange(n) / sr; f = f0 * (1 + 0.12 * np.sin(2 * np.pi * 3 * x)) * (1 - 0.25 * x / d)
    src = ((np.cumsum(f) / sr) % 1.0 - 0.5) * 2; src = src + 0.12 * rng.normal(0, 1, n)
    out = bp(src, 200, 700) * 0.9 + bp(src, 800, 1300) * 0.35
    syl = (np.sin(2 * np.pi * 3.2 * x - 0.4) > -0.25).astype(float) * 0.7 + 0.3
    return lp(out * syl, 2500) * np.sin(np.linspace(0, np.pi, n)) ** 0.7
def add(buf, t, sig, g=1.0):
    i = int(max(0, t) * sr); sig = sig[:max(0, len(buf) - i)]; buf[i:i + len(sig)] += sig * g
S = np.zeros(N)
def clank(f=620, d=0.35):
    x = t_(d); return (np.sin(2 * np.pi * f * x) * 0.5 + np.sin(2 * np.pi * f * 2.76 * x) * 0.3 + hp(noise(d), 2500) * 0.4) * np.exp(-x * 16)
def gong(f=180): x = t_(1.0); return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.4 * x)) * np.exp(-x * 3.5) * 0.6
def siren(d=0.8): x = t_(d); f = 700 + 300 * np.sign(np.sin(2 * np.pi * 3.5 * x)); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr)) * 0.28 * env(len(x), 0.01, 0.1)
def buzz(): x = t_(0.4); return np.sign(np.sin(2 * np.pi * 120 * x)) * 0.35 * env(len(x), 0.005, 0.06)
def drumroll(d): n = int(d * sr); x = noise(d) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t_(d))); return bp(x, 200, 3000) * np.linspace(0.05, 1, n)
def cymbal(): x = t_(1.1); return hp(noise(1.1), 5000) * np.exp(-x * 4) * 0.7
for sg in SEG: add(S, sg['start'] - 0.07, whoosh(0.28, 400, 2500), 0.25)
for sh in json.load(open(f'{OUT}/src/macaque/lpshots.json')): add(S, sh['from'] - 0.06, whoosh(0.22, 500, 3500), 0.45); add(S, sh['from'], thump(110, 0.12), 0.35)
add(S, 0.45, whoosh(0.4, 200, 1800), 0.8); add(S, 0.5, thump(70, 0.3), 1.2)                       # hook pull-back
for k in ('vertical', 'horizontal'): add(S, EV[k] - 0.05, boing(), 0.25); add(S, EV[k], ding(740, 0.3), 0.5)
REP = 1.05
for i, t in enumerate(np.arange(0.2, EV['r5'] + 8.0, REP)): add(S, t, clank(600, 0.3), 0.32); add(S, t + 0.04, clank(520, 0.3), 0.26)   # both machines, rep by rep
for k in ('r1', 'r2', 'r3', 'r4', 'r5', 'bonus'): add(S, EV[k] - 0.1, gong(170), 0.6); add(S, EV[k] - 0.1, chalk(), 0.5)
for k in ('pointA', 'pointD2', 'pointD5'): add(S, EV[k], ding(988), 0.8); add(S, EV[k] + 0.12, ding(1319), 0.7)
for k in ('draw3', 'draw4'): add(S, EV[k], tick(), 1.2); add(S, EV[k] + 0.25, tick(), 1.2); add(S, EV[k] + 0.5, ding(520, 0.5), 0.6)
add(S, EV['but'], siren(0.9), 0.7); add(S, EV['rounds'], thump(60, 0.3), 1.1); add(S, EV['danger'] - 0.05, siren(0.7), 0.9)
add(S, EV['seat'], thump(120, 0.15), 0.6); add(S, EV['stops'], clank(300, 0.25), 1.2); add(S, EV['stops'] + 0.12, clank(430, 0.25), 1.0)
add(S, EV['lock'], buzz(), 0.8)
add(S, EV['wins'] - 1.0, drumroll(1.0), 0.8); add(S, EV['wins'], cymbal(), 0.9)
for k in ('horiz', 'vert'): add(S, EV[k] - 0.05, ding(880, 0.4), 0.7)
for i, f in enumerate((392, 494, 587, 784)): add(S, EV['control'] + 0.3 * i, chime(f), 0.8)
add(S, EV['send'], boing(), 0.35); add(S, EV['send'] + 0.1, ding(1047, 0.5), 0.7)
for t in np.arange(10.0, D['dur'] - 2, 5.1): add(S, t, ding(1568, 0.3), 0.1)
def save(a, name, peak=0.9):
    a = a / max(1e-6, abs(a).max()) * peak; w = wave.open(f'{OUT}/public/audio/{name}', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype('<i2').tobytes()); w.close()
save(S, 'lp_sfx.wav'); print('ok')
