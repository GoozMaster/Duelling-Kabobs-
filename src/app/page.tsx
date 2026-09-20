import Image from "next/image";
import Link from "next/link";

import { type CuisineDisc, CuisineDiscs } from "@/components/home/cuisine-discs";
import s from "@/components/home/home.module.css";
import { badges, scenes } from "@/components/home/logos";
import { Overture } from "@/components/home/overture";
import { PantryProof } from "@/components/home/pantry-proof";
import { Reveal } from "@/components/home/reveal";
import { Sunburst } from "@/components/home/sunburst";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Rebuilt at most once an hour rather than on every request. The cuisine counts
 * are the only live data on this page and they only move when a recipe is
 * added, so a stale hour is harmless — and the showcase entry point stays a
 * prerendered file instead of a database round trip per visitor.
 *
 * This only works because the query below uses the cookie-free public client.
 * The cookie-bound one reads next/headers, which forces dynamic rendering and
 * makes this export a no-op.
 */
export const revalidate = 3600;

/** The five biggest cuisines, with their real counts. */
async function topCuisines(): Promise<CuisineDisc[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("recipes").select("cuisine");

  if (error || !data) return [];

  const tally = new Map<string, number>();
  for (const row of data) {
    if (row.cuisine) tally.set(row.cuisine, (tally.get(row.cuisine) ?? 0) + 1);
  }

  return [...tally.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
}

/**
 * The Sunburst — the chosen home page, built from Springfield Kitchen.
 *
 * A scroll-driven kebab duel opens the site; when it resolves, the sticky stage
 * unsticks and the bright sunburst hero scrolls up in its place, followed by
 * three plain sections. The cartoon dial is high, but the page never stops
 * being legible: flat cream ground, one hero line, one illustration.
 *
 * The page itself is a server component. Only the four pieces that are tied to
 * scroll or to entering the viewport ship JavaScript.
 */

// Admin sign-in. Only one account exists and it is not self-serve, so this is
// a link for the site owner rather than a call to action for visitors.
const ACCOUNT_HREF = "/login";

export default async function Home() {
  const cuisines = await topCuisines();

  return (
    <div className={s.home}>
      <Overture />

      <nav className={s.nav}>
        <span className={s.mark}>
          <span className={s.disc}>
            <Image src={badges.italian} alt="" width={34} height={34} />
          </span>
          DUELING KEBABS
        </span>
        <span className={s.spacer} />
        <span className={s.navLinks}>
          <Link href="/what-can-i-make">What can I make?</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href={ACCOUNT_HREF}>Log in</Link>
        </span>
      </nav>

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
              <Link className={s.btn} href="#cuisines">
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

      <section className={`${s.wrap} ${s.section}`} id="cuisines">
        <p className={s.eyebrow}>Your own cuisine list</p>
        <h2 className={s.sec}>EVERY KITCHEN YOU COOK IN</h2>
        <CuisineDiscs cuisines={cuisines} />
      </section>

      <section className={`${s.wrap} ${s.section}`} id="pantry">
        <p className={s.eyebrow}>The whole trick</p>
        <h2 className={s.sec}>PANTRY IN, DINNER OUT</h2>
        <PantryProof />
      </section>

      <div className={s.sky} id="start">
        <svg
          className={`${s.cloud} ${s.c1}`}
          width="150"
          height="46"
          viewBox="0 0 150 46"
          aria-hidden="true"
        >
          <path d="M26 42 a18 18 0 0 1 2-35 a24 24 0 0 1 45-4 a20 20 0 0 1 34 12 a16 16 0 0 1-8 27z" />
        </svg>
        <svg
          className={`${s.cloud} ${s.c2}`}
          width="110"
          height="36"
          viewBox="0 0 150 46"
          aria-hidden="true"
        >
          <path d="M26 42 a18 18 0 0 1 2-35 a24 24 0 0 1 45-4 a20 20 0 0 1 34 12 a16 16 0 0 1-8 27z" />
        </svg>
        <div className={s.wrap}>
          <Reveal>
            <h2 className={`${s.sec} ${s.skyHeading}`}>
              START WITH WHAT
              <br />
              YOU ALREADY HAVE
            </h2>
          </Reveal>
          {/* Not "create an account" — there is one account, it already
              exists, and nobody else can make one. Visitors need the recipes,
              not a sign-up they would be turned away from. */}
          <Reveal>
            <Link className={`${s.btn} ${s.primary}`} href="#cuisines">
              Browse the recipes
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
