/** Series identity: fixed character specs, palette and typography (reused by every episode). */
export const FX = {
  bg: '#07090D', blue: '#2F7BFF', red: '#FF3B3B', gold: '#FFC23D', white: '#FFFFFF', grey: '#9AA3B2', green: '#25D07D', cyan: '#3DE0FF',
  font: 'Montserrat, "DejaVu Sans", sans-serif',
};
export type CharSpec = {name: string; shirt: string; skin: string; hair: string; hairStyle: 'short' | 'quiff'; beard: boolean; rim: string};
/** Character A — Alex (blue shirt, dark short hair, clean-shaven). Character B — Daniel (red shirt, blond quiff, short beard). */
export const ALEX: CharSpec = {name: 'ALEX', shirt: '#2463E8', skin: '#D9A07A', hair: '#2A1C14', hairStyle: 'short', beard: false, rim: '#3D8BFF'};
export const DANIEL: CharSpec = {name: 'DANIEL', shirt: '#D92B2B', skin: '#EDC2A0', hair: '#C9A15A', hairStyle: 'quiff', beard: true, rim: '#FF4747'};
