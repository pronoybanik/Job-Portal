import { ArrowUpRight, BriefcaseBusiness } from "lucide-react"
import { Link } from "react-router-dom"

export function SiteFooter() {
  return (
    <footer className="bg-[#19221d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-10 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#b9f36b] text-[#19221d]">
                <BriefcaseBusiness aria-hidden="true" size={19} />
              </span>
              <span className="text-[21px] font-semibold tracking-[-0.06em]">workly</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Your next chapter starts here.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
              Find a role that fits your life, your ambition, and the way you want to work.
            </p>
          </div>
          <Link
            className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-[#b9f36b] px-5 text-sm font-semibold text-[#19221d] transition-colors hover:bg-[#c9fb8d]"
            to="/jobs"
          >
            Browse open roles <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-6 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Workly. Made for what’s next.</p>
          <div className="flex gap-6">
            <Link className="transition-colors hover:text-white" to="/">
              Home
            </Link>
            <Link className="transition-colors hover:text-white" to="/jobs">
              Find jobs
            </Link>
            <a className="transition-colors hover:text-white" href="mailto:hello@workly.example">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
