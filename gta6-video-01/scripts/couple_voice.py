"""Assemble the couple-video narration from the 5 user-provided parts, tightening pauses.
Writes remotion/public/audio/cp_voice.wav + remotion/src/macaque/cpsegments.json (sentence times + event times)."""
import json, numpy as np, subprocess, wave, sys
Z = sys.argv[1]            # folder with macaque2_parte1..5.wav
OUT = sys.argv[2]          # remotion dir
sr = 24000
def load(f):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-ar','24000','-ac','1','/tmp/_x.wav'],check=True)
    w = wave.open('/tmp/_x.wav'); return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
TXT = ["It's eleven at night, and you're a bloody macaque!",
 "You're more awake than ever! And the bedsheets know it. Thump, thump, thump... but right next to you, your partner is fast asleep.",
 "Attempt one: a gentle change of position. She snores louder! Chance of success: five per cent.",
 "Attempt two: you stroke her shoulder. She mumbles: \"Tomorrow!\"",
 "Attempt three: candles, soft music and perfumed sheets. She puts on her eye mask!",
 "One o'clock goes by. Two o'clock goes by. You're staring at the ceiling, counting sheep...",
 "Attempt four: a dramatic sigh! She rolls over. Your chance drops to one per cent!",
 "The room is heating up! Five degrees more. The thermometer hits thirty! And you keep right on going...",
 "Attempt five: pretend you're cold, so you can shuffle closer. She flings the blanket at you with all her might!",
 "Attempt six: you whisper in her ear. She answers in her sleep: \"Five more minutes!\"",
 "Attempt seven: pretend to be a sleepwalker and wander over to her side of the bed. But she isn't falling for it!",
 "You get closer... and closer... you're almost there...",
 "And then an alarm goes off: it's six in the morning!",
 "She wakes up with a start, looks at you and asks: \"Why are you awake?\"",
 "And you, with bags under your eyes down to the floor, can only answer: \"No reason... hee hee.\"",
 "She smiles, hugs you, and goes back to sleep on your chest.",
 "And you discover how hard it is to be a man sometimes...",
 "Send this to your partner, so she can see what a macaque she's sleeping next to!"]
# per part: sentences (index, start, end) in part time; events name->part time
PARTS = [
 [(0,0.40,2.86),(1,3.07,11.23),(2,11.44,18.16)],
 [(3,0.38,4.05),(4,4.49,11.11),(5,11.57,15.62),(6,15.93,21.75)],
 [(7,0.42,6.55),(8,6.92,13.60),(9,13.98,19.70)],
 [(10,0.39,5.12),(11,5.70,10.31),(12,10.84,14.23),(13,14.48,18.75)],
 [(14,0.45,6.49),(15,7.10,10.48),(16,10.91,14.22),(17,14.72,19.07)]]
EV = [  # (name, part, time)
 ('thump1',1,6.3),('thump2',1,7.0),('thump3',1,7.5),('asleep',1,10.5),('att1',1,11.6),('louder',1,15.1),('five',1,17.2),
 ('att2',2,0.45),('shoulder',2,1.7),('mumble1',2,3.75),('att3',2,4.6),('candles',2,5.3),('music',2,6.0),('perfume',2,7.0),('mask',2,8.6),('oclock1',2,9.9),('oclock2',2,11.6),('ceiling',2,14.1),('att4',2,15.95),('sigh',2,17.2),('roll',2,18.4),('one',2,20.8),
 ('heat',3,0.9),('thirty',3,4.4),('keep',3,5.3),('att5',3,6.95),('shuffle',3,9.7),('fling',3,11.2),('att6',3,13.95),('whisper',3,15.3),('mumble2',3,18.9),
 ('att7',4,0.5),('sleepw',4,2.3),('closer',4,7.1),('alarm',4,11.2),('wakes',4,14.5),('mumble3',4,18.6),
 ('noreason',5,4.8),('hehe',5,5.9),('hugs',5,8.0),('hard',5,11.8),('send',5,14.8),('end',5,18.6)]
GI, GS, MUM, LEAD = 0.12, 0.17, 0.55, 0.05
MUMS = {3, 9, 13}   # sentences followed by a sleepy mumble from her
out=[]; cur=0.0; seg={}; ev={}
for pi, sents in enumerate(PARTS):
    au = load(f'{Z}/macaque2_parte{pi+1}.wav'); dur = len(au)/sr
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
w=wave.open(f'{OUT}/public/audio/cp_voice.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y*32767).astype('<i2').tobytes()); w.close()
SPD = 1.06   # light speed-up (pitch preserved) for a more dynamic read
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OUT}/public/audio/cp_voice.wav','-filter:a',f'atempo={SPD}',f'{OUT}/public/audio/cp_voice2.wav'],check=True)
import os; os.replace(f'{OUT}/public/audio/cp_voice2.wav',f'{OUT}/public/audio/cp_voice.wav')
for k in seg: seg[k]['start']/=SPD; seg[k]['end']/=SPD
for n in ev: ev[n]/=SPD
y=np.zeros(int(len(y)/SPD))
json.dump({'segs':[seg[k] for k in range(18)],'events':ev,'dur':len(y)/sr},open(f'{OUT}/src/macaque/cpsegments.json','w'),indent=1)
print('voice seconds',len(y)/sr); print([(round(seg[k]['start'],1),round(seg[k]['end'],1)) for k in range(18)])
