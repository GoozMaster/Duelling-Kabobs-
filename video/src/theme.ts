/**
 * Springfield Kitchen, Daytime, as literal hex.
 *
 * The site reads these as `--sk-*` custom properties; a rendered video has no
 * theme to switch, so the values are copied rather than referenced. They are
 * the same numbers as the top of the `--sk-` block in src/app/globals.css.
 */
export const C = {
  surface: "#fdf6e3",
  raised: "#ffffff",
  sky: "#8ecae6",
  ink: "#16233f",
  muted: "#55617d",
  yellow: "#ffd90f",
  gold: "#f5a623",
  brick: "#a8382b",
  brickSoft: "#f8ddd6",
  teal: "#1f7a84",
  tealSoft: "#d8eff1",
  basil: "#2f7d4f",
  basilSoft: "#dcf0e2",
  sand: "#edcf9d",
} as const;

export const DISPLAY = '"Luckiest Guy", "Arial Black", Impact, sans-serif';
export const UI = 'Fredoka, "Trebuchet MS", Verdana, sans-serif';

/**
 * The video is drawn at roughly twice the site's scale: it is watched inside a
 * player a little under 1000px wide, so 1920px of canvas arrives at about half
 * size and a 15px label would land at 7px.
 */
export const KEY = 3 * 2; // the 3px keyline, at video scale
export const shadow = (px: number) => `${px}px ${px}px 0 ${C.ink}`;
export const STICKER = shadow(8);
export const POP = shadow(14);
export const PRESS = shadow(4);
