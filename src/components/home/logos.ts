import type { StaticImageData } from "next/image";

import americanBurger from "@/assets/logos/american-burger.jpg";
import chineseNoodles from "@/assets/logos/chinese-noodles.jpg";
import downWithHunger from "@/assets/logos/down-with-hunger.png";
import downWithHungerMark from "@/assets/logos/down-with-hunger-mark.png";
import duellingKebabs from "@/assets/logos/duelling-kebabs.png";
import frenchBaker from "@/assets/logos/french-baker.jpg";
import indianTurban from "@/assets/logos/indian-turban.jpg";
import italianChef from "@/assets/logos/italian-chef.jpg";
import japaneseSushi from "@/assets/logos/japanese-sushi.jpg";
import latinTaco from "@/assets/logos/latin-taco.jpg";
import persianKebab from "@/assets/logos/persian-kebab.jpg";

/**
 * The raster masters, under the names Springfield Kitchen gives them.
 *
 * Two classes that never mix: circular cuisine badges (radius-disc) and square
 * scene illustrations (radius-lg). The scenes are drawn in a heavier, warmer
 * hand than the badges, so the page keeps them apart rather than adjacent.
 */

export const scenes = {
  downWithHunger,
  // The protester's head, cropped from downWithHunger for the nav disc.
  downWithHungerMark,
  // Kept for the /dueling-kebabs page; the main site no longer shows it.
  duellingKebabs,
} satisfies Record<string, StaticImageData>;

export const badges = {
  italian: italianChef,
  japanese: japaneseSushi,
  persian: persianKebab,
  french: frenchBaker,
  chinese: chineseNoodles,
  american: americanBurger,
  latin: latinTaco,
  indian: indianTurban,
  // The Down with Hunger scene doubles as the Persian badge. It is square
  // artwork rather than a disc, but its subject sits in the middle, so the
  // disc's object-cover crop keeps the face and the wrap.
  downWithHunger,
} satisfies Record<string, StaticImageData>;

export type CuisineKey = keyof typeof badges;

/**
 * Which illustration stands for which real cuisine.
 *
 * The badges were drawn before the cuisine list existed, so they do not line up
 * with it. Italian and French match exactly. Asian and Mediterranean reuse a
 * plausible neighbour — a Japanese sushi badge for Asian, a Persian kebab for
 * Mediterranean — which is an approximation rather than a match, and worth
 * replacing once there is art for the categories themselves.
 *
 * Persian uses the Down with Hunger character, by request.
 *
 * Every other cuisine falls back to a drawn disc (components/cuisine-art.tsx). Keys are the cuisine names as
 * they are stored in the database.
 */
export const cuisineBadges: Partial<Record<string, CuisineKey>> = {
  Italian: "italian",
  French: "french",
  Asian: "japanese",
  Mediterranean: "persian",
  American: "american",
  Latin: "latin",
  Indian: "indian",
  Persian: "downWithHunger",
};

export function badgeForCuisine(name: string): StaticImageData | null {
  const key = cuisineBadges[name];
  return key ? badges[key] : null;
}
