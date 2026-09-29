import type { Metadata } from "next"
import { Rakkas } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"

import { scenes } from "@/components/home/logos"
import { MustacheBadge, VNeckBadge } from "@/components/dueling-kebabs/badges"

import s from "./dueling-kebabs.module.css"

/**
 * Loaded here rather than in the root layout, so the face is only fetched by
 * the one page that uses it. Its Arabic-inflected Latin is most of what makes
 * this read as somewhere else rather than the recipe app in new colours.
 */
const rakkas = Rakkas({
  variable: "--font-rakkas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dueling Kebabs",
  description:
    "Middle Eastern kebabs, argued over since the argument. Coming soon. Sort of.",
}

type Mark = "specialty" | "veg"
type Item = { name: string; note: string; marks?: Mark[] }
type Course = { course: string; title: string; items: Item[] }

const MENU: Course[] = [
  {
    course: "Mezze",
    title: "Opening Volleys",
    items: [
      { name: "Hummus at Dawn", note: "Whipped chickpea, olive oil duel-stripe, warm pita", marks: ["veg"] },
      { name: "Baba Ghanoush Armistice", note: "Smoky eggplant, pomegranate seeds, mint", marks: ["veg"] },
      { name: "Muhammara Cease-and-Desist", note: "Walnut and red pepper spread, sumac", marks: ["specialty", "veg"] },
      { name: "Falafel Firing Squad", note: "Six, crisp, tahini drizzle", marks: ["veg"] },
    ],
  },
  {
    course: "Kebabs",
    title: "Choose Your Weapon",
    items: [
      { name: "The Duel", note: "Two skewers, chicken shish vs. beef kofta. Judge for yourself", marks: ["specialty"] },
      { name: "Lamb Shish Truce", note: "Char-grilled lamb, sumac onions" },
      { name: "Shrimp Skewer Surrender", note: "Garlic-lemon shrimp, white flag of tzatziki" },
      { name: "Veggie Ceasefire", note: "Halloumi and seasonal vegetables, harissa yogurt", marks: ["specialty", "veg"] },
    ],
  },
  {
    course: "Sides",
    title: "Reinforcements",
    items: [
      { name: "Saffron Rice Armor", note: "Golden, buttery, and nothing gets through it", marks: ["veg"] },
      { name: "Shield Bread", note: "Fresh pita, straight from the fire", marks: ["veg"] },
      { name: "Skirmish Salad", note: "Fattoush, sumac vinaigrette", marks: ["veg"] },
      { name: "Pickled Turnip Peace Offering", note: "Pink, sour, and offered in good faith", marks: ["veg"] },
    ],
  },
  {
    course: "Desserts",
    title: "Sweet Surrender",
    items: [
      { name: "Baklava, Three Ways", note: "Pistachio, walnut, and the one we still argue about" },
      { name: "Knafeh: The Final Blow", note: "Molten cheese, crisp kataifi, syrup. Game over", marks: ["specialty"] },
      { name: "Rosewater Rice Pudding", note: "The only calm thing in the building" },
    ],
  },
  {
    course: "Drinks",
    title: "The Truce Table",
    items: [
      { name: "Mint Lemonade Peace Treaty", note: "Signed in triplicate, served over ice" },
      { name: "Persian Tea, No Strings Attached", note: "Loose leaf. We said what we said" },
      { name: "Ayran", note: "Cool down. Literally" },
    ],
  },
]

const BANNED: Array<{ name: string; reason: string }> = [
  { name: "Pesto Hummus", reason: "Hummus does not need a passport to Genoa." },
  { name: "“Deconstructed” Anything", reason: "If we wanted a puzzle we’d play chess." },
  { name: "Kale Tabbouleh", reason: "Kale is a garnish for a smoothie, not an herb salad." },
  { name: "“Shish Kebab”", reason: "It’s KA-BAB. Say it with us." },
  { name: "Ranch", reason: "Anywhere near this building." },
  { name: "Rainbow Hummus", reason: "Hummus is not a mood board." },
  { name: "Sriracha-Mayo Drizzle on Falafel", reason: "No." },
  { name: "Served in a Bowl", reason: "It is a plate. We do not do bowls." },
]

/** The ornament between courses: rule, diamond, star, diamond, rule. */
function Flourish() {
  return (
    <svg className={s.flourish} viewBox="0 0 240 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M4 12 H86 M154 12 H236" />
        <path d="M92 12 l6 -5 l6 5 l-6 5 Z M136 12 l6 -5 l6 5 l-6 5 Z" />
        <rect x="113" y="5" width="14" height="14" />
        <rect x="113" y="5" width="14" height="14" transform="rotate(45 120 12)" />
      </g>
      <circle cx="120" cy="12" r="2.4" fill="currentColor" />
    </svg>
  )
}

function Marks({ marks }: { marks?: Mark[] }) {
  if (!marks?.length) return null
  return (
    <span className={s.marks}>
      {marks.map((mark) =>
        mark === "specialty" ? (
          <MustacheBadge key={mark} label="House specialty or spicy" />
        ) : (
          <VNeckBadge key={mark} label="Vegetarian" />
        ),
      )}
    </span>
  )
}

/**
 * Dueling Kebabs — a restaurant that does not exist, as a sub-brand of the
 * recipe site. It keeps Springfield Kitchen's hard shadows, radii and easing
 * but none of its colours: gold on burgundy and cream, with no day/night
 * switch, so it reads as a different place rather than a themed page.
 *
 * Fully static and deliberately inert. There is nothing to submit — no
 * reservations, no signup, no hours — and the only link out is the way back.
 * Reached from the footer easter egg, never from the nav.
 */
export default function DuelingKebabs() {
  return (
    <div className={`${s.page} ${rakkas.variable}`}>
      <header className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroText}>
            <p className={s.ribbon}>Coming soon. Sort of.</p>
            <h1 className={s.name}>Dueling Kebabs</h1>
            <p className={s.since}>Since the argument</p>
          </div>
          {/* The art is a 300px master, so it is shown at no more than that:
              the frame around it carries the scale instead. */}
          <div className={s.heroArt}>
            <Image
              src={scenes.duellingKebabs}
              alt="Two cartoon cooks mid-argument, one brandishing a wrap and the other a kebab skewer"
              width={300}
              height={300}
              priority
            />
          </div>
        </div>
      </header>

      <main>
        <section className={s.bio} aria-labelledby="story">
          <h2 id="story" className={s.sectionTitle}>
            The story, depending who’s telling it
          </h2>
          <p>
            Two lifelong friends, one heated disagreement over whose family kebab
            recipe reigns supreme, and a truce that only held because someone
            suggested a restaurant instead of a duel. (The name stuck. The duel
            did not happen. Mostly.)
          </p>
          <p>
            Every dish on this menu has survived at least one shouting match in
            the kitchen. We do not do fusion. We do not do bowls. We have strong
            opinions about cumin and we are not sorry.
          </p>
        </section>

        <section className={s.menuSection} aria-labelledby="menu">
          <div className={s.frame}>
            <div className={s.card}>
              <h2 id="menu" className={s.menuTitle}>
                The Menu
              </h2>
              <ul className={s.legend}>
                <li>
                  <MustacheBadge size="lg" />
                  <span>
                    <strong>House specialty</strong> or it brings the heat
                  </span>
                </li>
                <li>
                  <VNeckBadge size="lg" />
                  <span>
                    <strong>Vegetarian.</strong> The deep V stands for vegetables
                  </span>
                </li>
              </ul>

              {MENU.map((course, index) => (
                <Fragment key={course.course}>
                  <Flourish />
                  <section className={s.course} aria-labelledby={`course-${index}`}>
                    <h3 id={`course-${index}`} className={s.courseTitle}>
                      <span className={s.courseName}>{course.course}</span>
                      {course.title}
                    </h3>
                    <ul className={s.items}>
                      {course.items.map((item) => (
                        <li key={item.name} className={s.item}>
                          <span className={s.itemName}>
                            {item.name}
                            <Marks marks={item.marks} />
                          </span>
                          <span className={s.itemNote}>{item.note}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </Fragment>
              ))}
              <Flourish />
            </div>
          </div>
        </section>

        <section className={s.banned} aria-labelledby="banned">
          <h2 id="banned" className={s.sectionTitle}>
            Not on this menu. Not on any menu.
          </h2>
          <p className={s.bannedLede}>
            Requests we have received, reviewed, and stamped.
          </p>
          <ul className={s.stamps}>
            {BANNED.map((ban, index) => (
              <li key={ban.name} className={s.ban}>
                <div className={s.stamp} style={{ "--tilt": `${[-8, 5, -3, 9, -6, 3, -10, 6][index]}deg` } as React.CSSProperties}>
                  <span className={s.stampName}>{ban.name}</span>
                  <span className={s.denied}>Denied</span>
                </div>
                <p className={s.reason}>{ban.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={s.foot}>
        <p>No reservations. No hours. No address. Just opinions.</p>
        <Link href="/">← Back to Down With Hunger</Link>
      </footer>
    </div>
  )
}
