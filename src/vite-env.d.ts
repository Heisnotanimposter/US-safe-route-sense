/// <reference types="vite/client" />

declare module 'mgrs' {
  export function forward(ll: [number, number], accuracy?: number): string;
  export function toPoint(mgrs: string): [number, number];
  export function inverse(mgrs: string): [number, number, number, number];
  const mgrsObj: {
    forward: (ll: [number, number], accuracy?: number) => string;
    toPoint: (mgrs: string) => [number, number];
    inverse: (mgrs: string) => [number, number, number, number];
  };
  export default mgrsObj;
}

declare module 'satellite.js';
