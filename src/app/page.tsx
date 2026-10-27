import Link from "next/link";

import { type CuisineDisc, CuisineDiscs } from "@/components/home/cuisine-discs";
import { ExplainerVideo } from "@/components/home/explainer-video";
import { HeroClip } from "@/components/home/hero-clip";
import s from "@/components/home/home.module.css";
import { Overture } from "@/components/home/overture";
import { type Pick, RecipeHighlight } from "@/components/home/recipe-highlight";
import AnimatedContent from "@/components/animated-content";
import { SkyDrift } from "@/components/home/sky-drift";
import { Sunburst } from "@/components/home/sunburst";
import { SiteFooter } from "@/components/site-footer/site-footer";
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
 * The five biggest cuisines with their real counts, three recipes at random,
 * and the size of the collection — all from one query, since the page needs
 * every row for the tally anyway and 127 rows is nothing.
 *
 * The sample is shuffled in TypeScript rather than `order by random()`, which
 * PostgREST cannot express. Adding a database function for a decorative
 * three-item list would be a lot of machinery for no gain.
 */
async function homeData(): Promise<{
  cuisines: CuisineDisc[];
  picks: Pick[];
  total: number;
}> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, cuisine, ingredients(count)");

  if (error || !data) return { cuisines: [], picks: [], total: 0 };

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

  const picks = shuffled.slice(0, 3).map(({ id, title, cuisine, ingredients }) => ({
    id,
    title,
    cuisine,
    ingredientCount: ingredients[0]?.count ?? 0,
  }));

  return { cuisines, picks, total: data.length };
}

/**
 * The Sunburst — the chosen home page, built from Springfield Kitchen.
 *
 * A short clip of the protester plays over the page on load and fades after
 * three seconds. Underneath, the page is one sky: the sun's rays radiate from
 * behind the protester across the hero and the tour, a cloud bank rolls in,
 * and the recipes and cuisines sit in open blue with clouds drifting behind.
 *
 * Every section opens with a heading that says plainly what it holds and a
 * sentence under it, and where there is somewhere further to go, a way there
 * on the far side of the same row.
 *
 * The page itself is a server component. Only the pieces tied to scroll, to
 * entering the viewport, or to the intro ship JavaScript.
 */
export default async function Home() {
  const { cuisines, picks, total } = await homeData();

  return (
    <div className={s.home}>
      <Overture />

      <SiteNav />

      <header className={s.hero}>
        <div className={`page-wrap ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <h1 className={s.big}>
              LET’S GET
              <br />COOKING!
            </h1>
            <p className={s.lede}>
              Tell it what is in your pantry, fridge and freezer, and it shows
              you the recipes you can cook right now. No shopping trip first.
            </p>
            <div className={s.cta}>
              <Link className={`${s.btn} ${s.primary}`} href="/what-can-i-make">
                Find recipes I can make
              </Link>
              <Link className={s.btn} href="/recipes">
                {total > 0 ? `Browse all ${total} recipes` : "Browse recipes"}
              </Link>
            </div>
          </div>

          {/* The hero logo is a square scene, so it takes radius-lg and a
              keyline rather than the badge discs' radius-disc. The sun sits
              behind it and radiates out across the page. */}
          <div className={s.heroart}>
            <Sunburst />
            <div className={s.panel}>
              <HeroClip />
            </div>
          </div>
        </div>
      </header>

      {/* The tour: the whole site in two minutes, for anyone who would rather
          be shown than read. Rendered from video/ — see video/README.md. */}
      <section className={s.tour} id="tour" aria-labelledby="tour-title">
        <div className={`page-wrap ${s.tourGrid}`}>
          <AnimatedContent distance={60} duration={0.9}>
            <div className={s.head}>
              <div>
                <h2 className={s.sec} id="tour-title">
                  See how it works
                </h2>
                <p className={s.sub}>A two-minute video tour of the site.</p>
              </div>
            </div>
            <ul className={s.covers}>
              <li>Type in the ingredients you have and see which recipes they cover.</li>
              <li>Browse every recipe by cuisine, on a spinning globe, or at random.</li>
              <li>Check what is in the pantry, the fridge and the freezer.</li>
            </ul>
          </AnimatedContent>
          <ExplainerVideo />
        </div>
      </section>

      <div className={s.sky}>
        <section className={s.skySection} id="picks" aria-labelledby="picks-title">
          <div className="page-wrap">
            <AnimatedContent distance={50} duration={0.8}>
              <div className={s.head}>
                <div>
                  <h2 className={s.sec} id="picks-title">
                    Three recipes to try
                  </h2>
                  <p className={s.sub}>
                    Picked at random from the collection. Reload the page for
                    three more.
                  </p>
                </div>
                <Link className={s.more} href="/recipes">
                  See all recipes
                </Link>
              </div>
            </AnimatedContent>
            <RecipeHighlight picks={picks} />
          </div>
        </section>

        <SkyDrift lane="middle" />

        <section className={s.skySection} id="cuisines" aria-labelledby="cuisines-title">
          <div className="page-wrap">
            <AnimatedContent distance={50} duration={0.8}>
              <div className={s.head}>
                <div>
                  <h2 className={s.sec} id="cuisines-title">
                    Browse by cuisine
                  </h2>
                  <p className={s.sub}>The five cuisines with the most recipes.</p>
                </div>
                <Link className={s.more} href="/recipes/by-cuisine">
                  See every cuisine on the globe
                </Link>
              </div>
            </AnimatedContent>
            <CuisineDiscs cuisines={cuisines} />
          </div>
        </section>

        <SkyDrift lane="end" />
      </div>

      <SiteFooter />
    </div>
  );
}
