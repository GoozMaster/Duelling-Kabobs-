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
