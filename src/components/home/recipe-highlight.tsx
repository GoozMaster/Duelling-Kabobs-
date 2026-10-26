import Link from "next/link";

import { CuisineArt } from "@/components/cuisine-art";

import s from "./home.module.css";

export type Pick = {
  id: string;
  title: string;
  cuisine: string | null;
  ingredientCount: number;
};

/**
 * Three recipes from the collection, chosen fresh on every load.
 *
 * The spec asks for a random sample per load, which is why the home page gives
 * up static rendering — Next.js decides static-versus-dynamic per route, not
 * per section, so one genuinely random block makes the whole page
 * server-rendered. See the comment on `dynamic` in app/page.tsx.
 */
export function RecipeHighlight({ picks }: { picks: Pick[] }) {
  if (picks.length === 0) {
    return (
      <div className={s.picksEmpty}>
        No recipes yet. They will show up here as they are added.
      </div>
    );
  }

  return (
    <div className={s.picks}>
      {picks.map((pick) => (
        <Link key={pick.id} className={s.pick} href={`/recipes/${pick.id}`}>
          <span className={s.pickArt}>
            <CuisineArt name={pick.cuisine ?? "Other"} px={88} />
          </span>
          <span>
            <span className={s.pickName}>{pick.title}</span>
            <span className={s.pickMeta}>
              {pick.cuisine ?? "Uncategorised"}
              {pick.ingredientCount > 0 &&
                `, ${pick.ingredientCount} ${pick.ingredientCount === 1 ? "ingredient" : "ingredients"}`}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
