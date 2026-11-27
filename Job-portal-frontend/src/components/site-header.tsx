import {
  ArrowUpRight,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Link, NavLink, useNavigate } from "react-router-dom"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { clearCredentials } from "@/store/auth-slice"
import type { AppDispatch, RootState } from "@/store/store"

const navigationLinks = [
  { label: "Home", to: "/", end: true },
  { label: "Find jobs", to: "/jobs", end: false },
  { label: "Dashboard", to: "/dashboard", end: false },
]

function NavigationItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navigationLinks.map(({ label, to, end }) => (
        <NavLink
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? "text-[#19221d]" : "text-[#727b74] hover:text-[#19221d]"}`
          }
          end={end}
          key={to}
          onClick={onNavigate}
          to={to}
        >
          {label}
        </NavLink>
      ))}
      <a
        className="text-sm font-medium text-[#727b74] transition-colors hover:text-[#19221d]"
        href="/#how-it-works"
        onClick={onNavigate}
      >
        How it works
      </a>
    </>
  )
}

export function SiteHeader() {
  const { token, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  function handleLogout() {
    window.localStorage.removeItem("token")
    dispatch(clearCredentials())
    navigate("/", { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e9ede7] bg-[#fafbf8]/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          aria-label="Workly home"
          className="flex items-center gap-2.5"
          to="/"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#b9f36b] text-[#19221d]">
            <BriefcaseBusiness aria-hidden="true" size={19} strokeWidth={2.2} />
          </span>
          <span className="text-[21px] font-semibold tracking-[-0.06em]">
            workly
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          <NavigationItems />
        </nav>

        <div className="flex items-center gap-2">
          {!token ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-[#465248] transition-colors hover:bg-[#f1f4ee]"
                to="/login"
              >
                Log in
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full bg-[#19221d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#344139]"
                to="/register"
              >
                Get started{" "}
                <ArrowUpRight aria-hidden="true" className="ml-1" size={16} />
              </Link>
            </div>
          ) : (
            <span className="hidden text-sm font-medium text-[#465248] sm:block">
              Hi, {user?.name ?? "there"}
            </span>
          )}

          <Popover>
            <PopoverTrigger
              aria-label="Open account menu"
              className="flex size-10 items-center justify-center rounded-full border border-[#e5e9e2] bg-white text-[#465248] transition-colors hover:bg-[#f2f5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789650]"
            >
              <UserRound aria-hidden="true" size={18} />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-64 rounded-2xl border border-[#e8ece6] bg-white p-2.5 shadow-xl"
            >
              <PopoverHeader className="rounded-xl bg-[#f4f7f1] p-3">
                <PopoverTitle className="text-sm font-semibold text-[#27312a]">
                  Your account
                </PopoverTitle>
                <PopoverDescription className="text-xs text-[#818a82]">
                  {token
                    ? `Signed in${user?.name ? ` as ${user.name}` : ""}.`
                    : "Sign in to manage your job search."}
                </PopoverDescription>
              </PopoverHeader>
              <div className="grid gap-1 pt-1">
                {token ? (
                  <>
                    <Link
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#4c584e] transition-colors hover:bg-[#f4f7f1]"
                      to="/dashboard"
                    >
                      <LayoutDashboard aria-hidden="true" size={16} />
                      Dashboard
                    </Link>
                    <Link
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#4c584e] transition-colors hover:bg-[#f4f7f1]"
                      to="/profile"
                    >
                      <UserRound aria-hidden="true" size={16} />
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#4c584e] transition-colors hover:bg-[#f4f7f1]"
                      to="/login"
                    >
                      Log in
                    </Link>
                    <Link
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#4c584e] transition-colors hover:bg-[#f4f7f1]"
                      to="/register"
                    >
                      Get started
                    </Link>
                  </>
                )}
                {token && (
                  <>
                    <div
                      aria-hidden="true"
                      className="my-1 border-t border-[#edf0eb]"
                    />
                    <button
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#9b514b] transition-colors hover:bg-[#fff3f1]"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut aria-hidden="true" size={16} />
                      Log out
                    </button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="md:hidden">
            <Popover>
              <PopoverTrigger
                aria-label="Open navigation menu"
                className="flex size-10 items-center justify-center rounded-full border border-[#e5e9e2] bg-white text-[#19221d] transition-colors hover:bg-[#f2f5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789650]"
              >
                <Menu aria-hidden="true" size={19} />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 rounded-2xl border border-[#e8ece6] bg-white p-3 shadow-xl"
              >
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-4 p-1"
                >
                  <NavigationItems />
                  <div className="border-t border-[#edf0eb] pt-3">
                    {token ? (
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[#9b514b] hover:bg-[#fff3f1]"
                        onClick={handleLogout}
                        type="button"
                      >
                        <LogOut aria-hidden="true" size={16} />
                        Log out
                      </button>
                    ) : (
                      <>
                        <Link
                          className="block rounded-lg px-2 py-2 text-sm font-medium text-[#465248] hover:bg-[#f4f7f1]"
                          to="/login"
                        >
                          Log in
                        </Link>
                        <Link
                          className="mt-1 block rounded-lg bg-[#19221d] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#344139]"
                          to="/register"
                        >
                          Get started
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  )
}
