"""Synthesise quiet SFX, her sleepy mumbles and a very low music bed for the couple video, timed from cpsegments.json."""
import json, sys, numpy as np, wave
from scipy.signal import butter, lfilter, sosfilt
OUT = sys.argv[1]
sr = 24000; rng = np.random.default_rng(7)
D = json.load(open(f'{OUT}/src/macaque/cpsegments.json')); EV = D['events']; SEG = D['segs']; N = int((D['dur'] + 1.5) * sr)
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
S = np.zeros(N); M = np.zeros(N); MU = np.zeros(N)
for sg in SEG: add(S, sg['start'] - 0.07, whoosh(0.28, 400, 2500), 0.35)          # scene whoosh on every line
add(S, 0.5 - 0.1, whoosh(0.4, 200, 1800), 0.7)                                       # hook pull-back
for t in np.arange(0.0, 0.5, 0.083): add(S, t, thump(70, 0.1), 0.5)                  # hook: bed rattle
for k in ('thump1', 'thump2', 'thump3'): add(S, EV[k], thump(100, 0.2), 1.0)
for t in np.arange(EV['thump3'] + 0.4, EV['asleep'] - 0.3, 0.12): add(S, t, thump(80, 0.1), 0.35)   # rattle while "right next to you"
add(S, EV['asleep'], snore(1.0, 0.6)); add(S, EV['louder'] - 0.1, snore(1.1, 1.0)); add(S, EV['five'], ding(988), 0.7)
for k in ('att1', 'att2', 'att3', 'att4', 'att5', 'att6', 'att7'): add(S, EV[k] - 0.1, chalk(), 0.9); add(S, EV[k] - 0.05, ding(660, 0.25), 0.4)
add(S, EV['shoulder'], boing(), 0.35)
add(S, EV['candles'], breath(0.4, 1500, 5000), 0.5)
for i, f in enumerate((523, 659, 784)): add(S, EV['music'] + 0.18 * i, chime(f), 0.9)
add(S, EV['perfume'], hp(noise(0.4), 4000) * np.hanning(int(0.4 * sr)) * 0.5, 0.8)
add(S, EV['mask'], np.concatenate([tick() * 1.4, np.zeros(int(0.04 * sr)), thump(150, 0.1)]), 0.9)
for t in np.arange(EV['oclock1'], EV['ceiling'] + 1.5, 0.5): add(S, t, tick(), 0.45)
for t in np.arange(EV['oclock1'] + 0.0, EV['ceiling'] - 1.0, 1.7): add(S, t, ding(520, 0.6), 0.25)
add(S, EV['sigh'], breath(1.0, 300, 2200), 1.0); add(S, EV['roll'], bp(noise(0.5), 300, 1800) * np.hanning(int(0.5 * sr)), 0.9); add(S, EV['roll'] + 0.25, thump(110, 0.15), 0.8)
add(S, EV['one'] + 0.05, glasscrack(), 0.9); add(S, EV['one'] + 0.35, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 110, int(0.5 * sr))) / sr) * np.hanning(int(0.5 * sr)) * 0.3, 0.8)
add(S, EV['heat'], hp(noise(EV['thirty'] - EV['heat']), 3500) * np.linspace(0.02, 0.5, int((EV['thirty'] - EV['heat']) * sr)), 0.5)
add(S, EV['thirty'], ding(1175), 0.7)
for t in np.arange(EV['keep'], EV['att5'] - 0.2, 0.11): add(S, t, thump(90, 0.1), 0.45)
add(S, EV['shuffle'], bp(noise(0.7), 300, 1500) * np.hanning(int(0.7 * sr)), 0.6)
add(S, EV['fling'] - 0.05, whoosh(0.5, 150, 2200), 1.0); add(S, EV['fling'] + 0.2, thump(60, 0.3), 1.0)
add(S, EV['whisper'], hp(noise(0.5), 3000) * np.hanning(int(0.5 * sr)) * 0.4, 0.8)
add(S, EV['sleepw'], spooky(), 0.8)
rise = int((EV['alarm'] - EV['closer'] - 0.3) * sr); x = np.arange(rise) / sr
add(S, EV['closer'], (np.sin(2 * np.pi * np.cumsum(np.linspace(90, 420, rise)) / sr) * 0.25 + hp(noise(rise / sr), 2500) * np.linspace(0, 0.25, rise)) * np.linspace(0.1, 1, rise), 0.7)
for t in np.arange(EV['closer'], EV['alarm'] - 0.3, 0.7): add(S, t, heartbeat(), 0.8)
for k in range(int((EV['wakes'] - EV['alarm'] - 0.3) / 0.5)):
    t0 = EV['alarm'] + 0.5 * k
    for j in range(3): add(S, t0 + 0.13 * j, beep(1500), 0.5)
add(S, EV['wakes'], np.concatenate([breath(0.25, 600, 4000) * 0.8, thump(120, 0.14)]), 0.9)
add(S, EV['hehe'], np.concatenate([chime(740)[:int(0.14 * sr)], chime(660)[:int(0.14 * sr)]]), 0.5)
for i, f in enumerate((587, 740, 880, 1175)): add(S, EV['hugs'] + 0.15 * i, chime(f), 0.9)
add(S, EV['hard'], boing(), 0.35)
add(S, EV['end'], ding(784, 0.7), 0.8)
for t in np.arange(10.0, D['dur'] - 2, 4.3): add(S, t, ding(1568, 0.3), 0.12)          # occasional star sparkles on the blanket
add(MU, EV['mumble1'], mumble(0.8, 195), 1.0); add(MU, EV['mumble2'], mumble(0.9, 185), 1.0); add(MU, EV['mumble3'], mumble(0.9, 170) , 1.0)
x = np.arange(N) / sr   # very quiet pad
for i, ch in enumerate(((220, 277, 330), (196, 247, 294), (233, 294, 349), (220, 277, 330))):
    a, b = int(i * N / 4), int((i + 1) * N / 4); xx = x[a:b]
    M[a:b] = sum(np.sin(2 * np.pi * f * xx) for f in ch) * 0.2 * np.sin(np.pi * (xx - xx[0]) / (xx[-1] - xx[0] + 1e-9)) ** 0.5
def save(a, name, peak=0.9):
    a = a / max(1e-6, abs(a).max()) * peak; w = wave.open(f'{OUT}/public/audio/{name}', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype('<i2').tobytes()); w.close()
save(S, 'cp_sfx.wav'); save(MU, 'cp_mumble.wav'); save(M, 'cp_music.wav', 0.5)
print('ok', N / sr)
