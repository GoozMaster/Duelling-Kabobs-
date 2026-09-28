import { SiteNav } from "@/components/site-nav/site-nav"

/**
 * The shared header over every admin page, so the stock and recipe menus are
 * one click away from the dashboard, the pantry and the recipe forms too.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  )
}
