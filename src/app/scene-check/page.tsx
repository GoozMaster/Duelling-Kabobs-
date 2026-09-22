import { CookingAnimation } from "@/components/home/cooking-animation"

// TEMPORARY scratch route for eyeballing every waiting scene at once.
// Deleted before commit — it exists only so the five can be compared side by
// side, which a loader that lives for 300ms cannot be.
export default function SceneCheck() {
  return (
    <main className="grid grid-cols-3 gap-4 p-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="border-border rounded-lg border-2">
          <CookingAnimation count={i} />
        </div>
      ))}
    </main>
  )
}
