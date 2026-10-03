import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NotificationBell } from "./notification-bell"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="flex mt-2  h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) justify-between">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />

      </div>
      <div className="flex items-center justify-end px-6 gap-3">
        <NotificationBell />
        <NavUser />
        <ModeToggle />
      </div>
    </header>
  )
}
