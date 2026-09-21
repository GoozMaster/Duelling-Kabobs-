import Image from "next/image";
import Link from "next/link";

import { type CuisineDisc, CuisineDiscs } from "@/components/home/cuisine-discs";
import s from "@/components/home/home.module.css";
import { scenes } from "@/components/home/logos";
import { Overture, OvertureStill } from "@/components/home/overture";
import { type Pick, RecipeHighlight } from "@/components/home/recipe-highlight";
import { Reveal } from "@/components/home/reveal";
import { SkyDrift } from "@/components/home/sky-drift";
import { Sunburst } from "@/components/home/sunburst";
import { SiteNav } from "@/components/site-nav/site-nav";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Server-rendered on every request, deliberately.
 *
 * The recipe highlight is specified as a fresh random three per load, and
 * Next.js decides static-versus-dynamic per route rather than per section —
 * without Partial Prerendering, which is not enabled here, one genuinely
 * random block makes the whole page dynamic.
 *
 * This page was previously static with a one-hour revalidate. That export is
 * gone rather than left in place: once the route is dynamic it does nothing,
 * and a config line that silently has no effect is exactly what hid the
 * static-to-dynamic regression when the cuisine counts were first added.
 */
export const dynamic = "force-dynamic";

/**
 * The five biggest cuisines with their real counts, and three recipes at
 * random — both from one query, since the page needs every row for the tally
 * anyway and 126 rows is nothing.
 *
 * The sample is shuffled in TypeScript rather than `order by random()`, which
 * PostgREST cannot express. Adding a database function for a decorative
 * three-item list would be a lot of machinery for no gain.
 */
async function homeData(): Promise<{ cuisines: CuisineDisc[]; picks: Pick[] }> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, cuisine");

  if (error || !data) return { cuisines: [], picks: [] };

  const tally = new Map<string, number>();
  for (const row of data) {
    if (row.cuisine) tally.set(row.cuisine, (tally.get(row.cuisine) ?? 0) + 1);
  }

  const cuisines = [...tally.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);

  // Fisher-Yates over a copy: sorting by Math.random() is the common shortcut
  // and it is measurably biased, favouring some positions over others.
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return { cuisines, picks: shuffled.slice(0, 3) };
}

/**
 * The Sunburst — the chosen home page, built from Springfield Kitchen.
 *
 * A short kebab-duel clip plays over the page on load and fades after three
 * seconds, revealing the sunburst hero. Below it the page falls through a
 * cream-to-sky gradient with SkyDrift's clouds parallaxing over it, and lands
 * on the cuisine list sitting in open sky.
 *
 * It used to carry two more sections. "Pantry in, dinner out" explained the
 * app to someone already using it and offered nothing to click, and the closing
 * "Start with what you already have" ended on a button that only scrolled back
 * up the page. Both are gone; the sky they sat on was the part worth keeping.
 *
 * The cartoon dial is high, but the page never stops being legible: flat
 * ground, one hero line, one illustration.
 *
 * The intro used to be 2.6 screens of scroll driving a hand-animated SVG. That
 * artwork now lives in DuelStill, shown instead of the video to anyone who asks
 * for reduced motion.
 *
 * The page itself is a server component. Only the pieces tied to scroll, to
 * entering the viewport, or to the intro ship JavaScript.
 */
export default async function Home() {
  const { cuisines, picks } = await homeData();

  return (
    <div className={s.home}>
      <Overture />
      <SkyDrift />

      <SiteNav />

      <OvertureStill />

      <div className={s.top}>
        <Sunburst />
        <div className={s.wrap}>
          <div>
            <span className={s.kicker}>No shopping list required</span>
            <h1 className={s.big}>
              WHAT CAN
              <br />I MAKE?
            </h1>
            <p className={s.lede}>
              Tell it what is in your pantry, your fridge and your freezer. It
              tells you what you can cook right now.
            </p>
            <div className={s.cta}>
              <Link className={`${s.btn} ${s.primary}`} href="/what-can-i-make">
                Open the fridge
              </Link>
              <Link className={s.btn} href="#picks">
                See a recipe
              </Link>
            </div>
          </div>

          {/* The hero logo is a square scene, so it takes radius-lg and a
              keyline rather than the badge discs' radius-disc. Its sand backing
              is sampled from the illustration's own ground. */}
          <div className={s.heroart}>
            <div className={s.panel}>
              <Image
                src={scenes.downWithHunger}
                alt="Down with Hunger — a cartoon man holding a protest placard in one hand and a shawarma in the other, mid-shout"
                priority
              />
            </div>
            <span className={s.placard}>DOWN WITH HUNGER</span>
          </div>
        </div>
      </div>

      {/* This section carries the ground from cream to sky, so the wrap moves
          inside it — the gradient needs the full page width, the text does not. */}
      <section className={`${s.section} ${s.toSky}`} id="picks">
        <div className={s.wrap}>
          <p className={s.eyebrow}>Three from the collection</p>
          <h2 className={s.sec}>TONIGHT, MAYBE?</h2>
          <RecipeHighlight picks={picks} />
        </div>
      </section>

      {/* The cuisine list closes the page on the sky band. It was the last
          thing standing between the hero and a dead call-to-action button; now
          it *is* the ending, which is why it takes the blue and the clouds. */}
      <section className={s.skyBand} id="cuisines">
        <svg
          className={`${s.bandCloud} ${s.bandCloud1}`}
          viewBox="0 0 150 46"
          aria-hidden="true"
        >
          <path d="M26 42 a18 18 0 0 1 2-35 a24 24 0 0 1 45-4 a20 20 0 0 1 34 12 a16 16 0 0 1-8 27z" />
        </svg>
        <svg
          className={`${s.bandCloud} ${s.bandCloud2}`}
          viewBox="0 0 150 46"
          aria-hidden="true"
        >
          <path d="M20 40 a16 16 0 0 1 6-31 a22 22 0 0 1 38-6 a18 18 0 0 1 30 14 a15 15 0 0 1-10 23z" />
        </svg>
        <div className={s.wrap}>
          <Reveal>
            <p className={`${s.eyebrow} ${s.skyEyebrow}`}>What you cook most</p>
            <h2 className={`${s.sec} ${s.skyHeading}`}>YOUR TOP FIVE CUISINES</h2>
          </Reveal>
          <CuisineDiscs cuisines={cuisines} />
        </div>
      </section>
    </div>
  );
}
