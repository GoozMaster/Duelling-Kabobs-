import type { StaticImageData } from "next/image";

import chineseNoodles from "@/assets/logos/chinese-noodles.jpg";
import downWithHunger from "@/assets/logos/down-with-hunger.png";
import duellingKebabs from "@/assets/logos/duelling-kebabs.png";
import frenchBaker from "@/assets/logos/french-baker.jpg";
import italianChef from "@/assets/logos/italian-chef.jpg";
import japaneseSushi from "@/assets/logos/japanese-sushi.jpg";
import persianKebab from "@/assets/logos/persian-kebab.jpg";

/**
 * The seven raster masters, under the names Springfield Kitchen gives them.
 *
 * Two classes that never mix: circular cuisine badges (radius-disc) and square
 * scene illustrations (radius-lg). The scenes are drawn in a heavier, warmer
 * hand than the badges, so the page keeps them apart rather than adjacent.
 */

export const scenes = {
  downWithHunger,
  duellingKebabs,
} satisfies Record<string, StaticImageData>;

export const badges = {
  italian: italianChef,
  japanese: japaneseSushi,
  persian: persianKebab,
  french: frenchBaker,
  chinese: chineseNoodles,
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
 * Every other cuisine falls back to a text disc. Keys are the cuisine names as
 * they are stored in the database.
 */
export const cuisineBadges: Partial<Record<string, CuisineKey>> = {
  Italian: "italian",
  French: "french",
  Asian: "japanese",
  Mediterranean: "persian",
};

export function badgeForCuisine(name: string): StaticImageData | null {
  const key = cuisineBadges[name];
  return key ? badges[key] : null;
}
