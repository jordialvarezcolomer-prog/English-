"""Assemble the leg-press narration (6 parts) from the 5 user-provided parts, tightening pauses.
Writes remotion/public/audio/lp_voice.wav + remotion/src/macaque/lpsegments.json (sentence times + event times)."""
import json, numpy as np, subprocess, wave, sys
Z = sys.argv[1]            # folder with legpress_parte1..5.wav
OUT = sys.argv[2]          # remotion dir
sr = 24000
def load(f):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-ar','24000','-ac','1','/tmp/_x.wav'],check=True)
    w = wave.open('/tmp/_x.wav'); return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
TXT = ["Which is better: the vertical leg press or the horizontal one? Today, we settle it!",
 "Two machines. Two lifters. One winner... or is there?",
 "On the left, Alex, lying down, pushing towards the ceiling. On the right, Daniel, sitting, pushing straight ahead.",
 "Round one: range of motion. On the vertical one, your knees come closer to your chest, so you can go deeper. Point to Alex!",
 "But careful: go too deep, and your pelvis lifts off the pad, and your lower back rounds. Danger!",
 "Round two: your back. On the horizontal one, the seat holds you in place, and your lower back is better supported. Point to Daniel!",
 "Round three: safety. Both have safety stops. Use them always, and never lock your knees at the top. It's a draw!",
 "Round four: the muscles. Feet higher, and you work more glutes and hamstrings. Feet lower, and it's more quads. And that goes for both machines. Another draw!",
 "Round five: convenience. You'll find the horizontal one in almost every gym, and it's easy to adjust. The vertical one is rarer. Point to Daniel!",
 "Bonus round: the warm-up. Whichever you choose, start with a light set, and add weight slowly.",
 "So... who wins? It depends on you.",
 "If you're just starting out, or your back bothers you: go horizontal.",
 "If you're experienced, with good mobility: the vertical gives you more range.",
 "And most importantly: pick the one you can control, and keep adding weight little by little. Quality reps beat ego every time!",
 "Tell me which one you use! And send this to your gym buddy, so they can stop fighting over the machine!"]
PARTS = [
 [(0,0.40,5.55),(1,5.65,9.60),(2,9.80,16.57)],
 [(3,0.40,9.29),(4,9.71,14.97)],
 [(5,0.41,8.70),(6,8.94,16.84)],
 [(7,0.45,11.15),(8,11.25,21.21)],
 [(9,0.42,6.72),(10,7.14,9.05),(11,9.10,12.91),(12,13.33,17.81)],
 [(13,0.40,8.55),(14,9.01,15.02)]]
EV = [('vertical',1,1.5),('horizontal',1,3.0),('alex',1,10.5),('daniel',1,14.2),
 ('r1',2,0.4),('deeper',2,6.6),('pointA',2,7.7),('but',2,8.6),('rounds',2,13.2),('danger',2,14.3),
 ('r2',3,0.4),('seat',3,3.8),('pointD2',3,7.8),('r3',3,8.9),('stops',3,11.3),('lock',3,14.2),('draw3',3,16.2),
 ('r4',4,0.4),('higher',4,2.6),('lower',4,5.8),('both',4,8.9),('draw4',4,10.5),('r5',4,11.3),('rare',4,19.1),('pointD5',4,20.4),
 ('bonus',5,0.4),('light',5,4.0),('wins',5,7.1),('horiz',5,11.9),('vert',5,15.9),
 ('control',6,2.6),('tell',6,9.0),('send',6,11.2)]
MUMS = set()
GI, GS, MUM, LEAD = 0.12, 0.17, 0.55, 0.05
MUMS = {3, 9, 13}   # sentences followed by a sleepy mumble from her
out=[]; cur=0.0; seg={}; ev={}
for pi, sents in enumerate(PARTS):
    au = load(f'{Z}/legpress_parte{pi+1}.wav'); dur = len(au)/sr
    win=int(0.01*sr); env=np.array([abs(au[i:i+win]).max() for i in range(0,len(au),win)]); quiet=env<0.0126
    runs=[];i=0
    while i<len(quiet):
        j=i
        while j<len(quiet) and quiet[j]==quiet[i]: j+=1
        runs.append((bool(quiet[i]), i*0.01, min(j*0.01,dur))); i=j
    pieces=[]; pos=cur; audio=[]
    last_sent_end = sents[-1][0]
    for q,a,b in runs:
        if q and b-a>=0.15:
            first = a==0; last = b>=dur-0.02
            isb = any(abs(a-e)<0.2 or abs(b-s)<0.2 for _,s,e in sents)
            if first: L = 0.12 if pi>0 else LEAD
            elif last: L = (MUM if sents[-1][0] in MUMS else 0.05)
            elif isb: L = MUM if any(abs(a-e)<0.2 and k in MUMS for k,_,e in sents) else GS
            else: L = GI
            pieces.append((a,b,pos,pos+L)); audio.append(np.zeros(int(L*sr))); pos+=L
        else:
            audio.append(au[int(a*sr):int(b*sr)]); pieces.append((a,b,pos,pos+(b-a))); pos+=(b-a)
    def nt(t):
        for a,b,x,y in pieces:
            if a<=t<=b+1e-9: return x+(y-x)*((t-a)/max(1e-9,b-a))
        return pos
    for k,s,e in sents: seg[k]={'start':nt(s),'end':nt(e),'text':TXT[k]}
    for n,p,t in EV:
        if p==pi+1: ev[n]=nt(t)
    out.append(np.concatenate(audio)); cur=pos
y=np.concatenate(out)
rms=np.sqrt(np.mean(y[abs(y)>0.01]**2)); y=y*0.12/rms; y/=max(1,abs(y).max()/0.95)
w=wave.open(f'{OUT}/public/audio/lp_voice.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y*32767).astype('<i2').tobytes()); w.close()
SPD = 1.05   # light speed-up (pitch preserved) for a more dynamic read
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OUT}/public/audio/lp_voice.wav','-filter:a',f'atempo={SPD}',f'{OUT}/public/audio/lp_voice2.wav'],check=True)
import os; os.replace(f'{OUT}/public/audio/lp_voice2.wav',f'{OUT}/public/audio/lp_voice.wav')
# make the narration clearer/louder: gentle compression + make-up gain + peak limiter (the music/SFX levels in the mix stay the same)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OUT}/public/audio/lp_voice.wav','-af','acompressor=threshold=-24dB:ratio=3:attack=5:release=90:makeup=1.6,alimiter=limit=0.93','/tmp/_vb.wav'],check=True)
os.replace('/tmp/_vb.wav',f'{OUT}/public/audio/lp_voice.wav')
for k in seg: seg[k]['start']/=SPD; seg[k]['end']/=SPD
for n in ev: ev[n]/=SPD
y=np.zeros(int(len(y)/SPD))
json.dump({'segs':[seg[k] for k in range(15)],'events':ev,'dur':len(y)/sr},open(f'{OUT}/src/macaque/lpsegments.json','w'),indent=1)
print('voice seconds',len(y)/sr); print([(round(seg[k]['start'],1),round(seg[k]['end'],1)) for k in range(15)])
