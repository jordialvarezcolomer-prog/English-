import {toNew, NEW_VOICE_END} from './time';
/** Episode 1 (creatine) — ORIGINAL-clock scene boundaries & captions (measured on creatine_voice.mp3). */
export const EP1 = {
  hook: [0, 11.28], day0: [11.28, 18.2], difference: [18.2, 24.23], inside: [24.23, 37.1],
  weeks: [37.1, 46.14], day60: [46.14, 55.44], day90: [55.44, 63.03], final: [63.03, 73.6],
} as const;
export const EP1_END = NEW_VOICE_END + 2.6;
export const EP1_TOTAL = Math.round(EP1_END * 30);
/** Scene start/end on the tightened clock. */
export const sceneNew = (k: keyof typeof EP1): [number, number] => [toNew(EP1[k][0]), k === 'final' ? EP1_END : toNew(EP1[k][1])];
/** [start, end, text, highlight words] */
export const EP1_CAPTIONS: [number, number, string, string[]][] = [
  [0.02, 2.95, 'These two guys are about to train for NINETY days.', ['NINETY', 'days.']], [3.35, 5.73, 'One takes creatine every single day.', ['creatine']], [6.15, 8.07, 'The other takes absolutely nothing.', ['nothing.']], [8.59, 9.47, 'And the results...', []], [9.88, 10.86, 'might surprise you.', ['surprise']],
  [11.28, 12.0, 'Day zero.', ['zero.']], [12.22, 14.2, 'Same weight, similar physiques,', ['Same']], [14.46, 15.87, 'the exact same workout.', ['workout.']], [16.07, 16.84, 'Same food.', ['food.']], [17.11, 17.85, 'Same sleep.', ['sleep.']],
  [18.2, 19.38, "But there's ONE difference.", ['ONE']], [19.88, 22.67, 'Alex takes five grams of creatine every day.', ['five', 'grams', 'creatine']], [23.09, 23.97, "Daniel doesn't.", ["doesn't."]],
  [24.23, 25.43, 'So what happens inside?', ['inside?']], [25.85, 30.32, 'Over a few weeks, creatine tops up the phosphocreatine stored in your muscles.', ['phosphocreatine']], [30.76, 32.99, 'That helps rebuild ATP faster,', ['ATP']], [33.36, 36.64, 'the energy your muscles burn during short, intense efforts.', ['short,', 'intense']],
  [37.1, 38.19, 'Weeks two to four.', ['two', 'four.']], [38.64, 39.67, 'Both get stronger.', ['stronger.']], [39.94, 41.49, 'But on repeated hard sets,', ['repeated']], [41.75, 44.13, 'Alex may squeeze out an extra rep or two.', ['extra', 'rep']], [44.49, 45.71, 'And that adds up.', ['adds', 'up.']],
  [46.14, 46.98, 'Day sixty.', ['sixty.']], [47.39, 50.43, 'Creatine pulls more water INTO the muscle cells.', ['water', 'INTO']], [50.85, 52.89, 'That can mean a kilo or two on the scale...', ['kilo']], [53.3, 54.08, "but it's water,", ['water,']], [54.28, 55.17, 'not new muscle.', ['not']],
  [55.44, 56.28, 'Day ninety.', ['ninety.']], [56.76, 57.7, 'Both built muscle,', ['muscle,']], [57.89, 59.26, 'because both trained hard.', ['hard.']], [59.95, 62.63, 'Alex may just have trained with a bit more performance.', ['performance.']],
  [63.03, 64.47, "Creatine isn't magic.", ['magic.']], [64.75, 67.23, 'Training, food, and recovery matter most.', ['Training,', 'food,', 'recovery']], [67.72, 69.09, 'But it can give you an edge.', ['edge.']], [69.26, 70.08, 'Would you take it?', ['take']],
];
