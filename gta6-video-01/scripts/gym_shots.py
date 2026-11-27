"""Shot list for the leg-press video (times from lpsegments.json events). Writes remotion/src/macaque/lpshots.json."""
import json, sys
OUT = sys.argv[1]
D = json.load(open(f'{OUT}/src/macaque/lpsegments.json')); EV = D['events']; END = D['dur'] + 0.9
S = [('hook', 0, 4.6), ('q1', 4.6, 5.6), ('q2', 5.6, 6.6), ('q3', 6.6, 7.8), ('intro_a', 7.8, 11.0), ('intro_d', 11.0, EV['r1']),
 ('r1_a', EV['r1'], EV['r1'] + 2.8), ('r1_d', EV['r1'] + 2.8, EV['but'] - 2.0), ('r1_cmp', EV['but'] - 2.0, EV['but']),
 ('dng_a', EV['but'], EV['but'] + 2.4), ('dng_spine', EV['but'] + 2.4, EV['r2']),
 ('r2_d', EV['r2'], EV['r2'] + 3.6), ('r2_a', EV['r2'] + 3.6, EV['r3']),
 ('r3_stops', EV['r3'], EV['r3'] + 3.4), ('r3_knees', EV['r3'] + 3.4, EV['r4']),
 ('r4_high', EV['r4'], EV['lower'] - 0.2), ('r4_low', EV['lower'] - 0.2, EV['both'] - 0.4), ('r4_both', EV['both'] - 0.4, EV['r5']),
 ('r5_floor', EV['r5'], EV['bonus']), ('bonus', EV['bonus'], EV['wins'] - 0.2), ('wins', EV['wins'] - 0.2, EV['horiz'] - 0.2),
 ('beg', EV['horiz'] - 0.2, EV['vert'] - 0.2), ('exp', EV['vert'] - 0.2, EV['control'] - 0.1), ('ctrl', EV['control'] - 0.1, EV['tell']), ('cta', EV['tell'], END)]
SP = {'hook': 1.8, 'q1': 1.8, 'q2': 1.8, 'q3': 1.8, 'intro_a': 1.8, 'intro_d': 1.8, 'r1_a': 1.0, 'r1_d': 1.0, 'r1_cmp': 1.0, 'dng_a': 1.0, 'r2_d': 1.7, 'r2_a': 1.7,
      'r3_stops': 0.6, 'r4_high': 0.9, 'r4_low': 0.9, 'r5_floor': 1.8, 'bonus': 1.2, 'beg': 1.6, 'exp': 1.6, 'ctrl': 1.6}
json.dump([{'name': n, 'from': a, 'to': b, 'speed': SP.get(n, 0)} for n, a, b in S], open(f'{OUT}/src/macaque/lpshots.json', 'w'), indent=1)
print(len(S), 'shots')
