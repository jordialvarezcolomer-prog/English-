/** Series identity: fixed character specs, palette and typography (reused by every episode). */
export const FX = {
  bg: '#07090D', blue: '#2F7BFF', red: '#FF3B3B', gold: '#FFC23D', white: '#FFFFFF', grey: '#9AA3B2', green: '#25D07D', cyan: '#3DE0FF',
  font: 'Montserrat, "DejaVu Sans", sans-serif',
};
export type CharSpec = {name: string; shirt: string; skin: string; hair: string; hairStyle: 'short' | 'quiff' | 'mohawk'; beard: boolean; rim: string; beardColor?: string;
  /** outfit: tank top or tee, two-tone/band colours, shorts colour + side stripe */
  top: 'tank' | 'tee'; print: string; printSub: string; printInk: string; shorts: string; stripe: string};
/** Character A — Alex (blue shirt, dark short hair, clean-shaven). Character B — Daniel (red shirt, blond quiff, short beard). */
export const ALEX: CharSpec = {name: 'ALEX', shirt: '#2463E8', skin: '#E3A88C', hair: '#2A1C14', hairStyle: 'short', beard: false, rim: '#3D8BFF', top: 'tee', print: 'NO DAYS OFF', printSub: 'TRAIN · EAT · SLEEP', printInk: '#FFFFFF', shorts: '#3B404B', stripe: '#3D8BFF'};
export const DANIEL: CharSpec = {name: 'DANIEL', shirt: '#D92B2B', skin: '#F2C6B2', hair: '#D8231B', hairStyle: 'mohawk', beard: true, beardColor: '#16100D', rim: '#FF4747', top: 'tank', print: 'BEAST', printSub: 'MODE ON', printInk: '#111216', shorts: '#121318', stripe: '#FF3B30'};
