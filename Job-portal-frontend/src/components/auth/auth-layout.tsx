import { ArrowUpRight, BriefcaseBusiness, Check, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-[#fafbf8] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-svh overflow-hidden bg-[#19221d] text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-20">
        <div aria-hidden="true" className="absolute -right-36 -top-32 size-[520px] rounded-full bg-[#73994c]/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-48 -left-36 size-[520px] rounded-full bg-[#b9f36b]/10 blur-3xl" />
        <Link aria-label="Workly home" className="relative inline-flex w-fit items-center gap-2.5" to="/">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#b9f36b] text-[#19221d]">
            <BriefcaseBusiness aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <span className="text-[22px] font-semibold tracking-[-0.06em]">workly</span>
        </Link>

        <div className="relative mx-auto w-full max-w-xl py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-[#d3dfc9]">
            <Sparkles aria-hidden="true" className="text-[#b9f36b]" size={14} />
            Make your next move
          </span>
          <h1 className="mt-7 text-5xl leading-[1.05] font-semibold tracking-[-0.07em] xl:text-6xl">
            Find work that
            <br />
            <span className="text-[#b9f36b]">moves you.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            Good people and good opportunities belong together. Let’s find your fit.
          </p>

          <div className="relative mt-12 max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#d8e8c9] text-sm font-bold text-[#344b2d]">
                  N
                </span>
                <div>
                  <p className="text-sm font-semibold">Northstar Studio</p>
                  <p className="mt-1 text-xs text-white/55">Remote · Full-time</p>
                </div>
              </div>
              <span className="rounded-full bg-[#b9f36b]/15 px-3 py-1 text-[11px] font-medium text-[#c8f49a]">
                Great fit
              </span>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-lg font-semibold tracking-tight">Product Designer</p>
              <p className="mt-1 text-sm text-white/55">$110k – $145k · Posted today</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">Product</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">Design</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">Figma</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-white/55">
            <Check aria-hidden="true" className="text-[#b9f36b]" size={15} />
            Curated roles. A more thoughtful job search.
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2026 Workly. Find your next chapter.</p>
      </section>

      <section className="flex min-h-svh flex-col px-5 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <Link aria-label="Workly home" className="inline-flex w-fit items-center gap-2 lg:hidden" to="/">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#b9f36b] text-[#19221d]">
              <BriefcaseBusiness aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
            <span className="text-xl font-semibold tracking-[-0.06em] text-[#19221d]">workly</span>
          </Link>
          <div className="flex flex-1 flex-col justify-center py-10">{children}</div>
          <div className="flex items-center justify-between gap-4 border-t border-[#e9ede7] pt-5 text-xs text-[#8a938b]">
            <Link className="transition-colors hover:text-[#344b2d]" to="/">
              Back to home
            </Link>
            <span className="inline-flex items-center gap-1">
              Find your fit <ArrowUpRight aria-hidden="true" size={13} />
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
