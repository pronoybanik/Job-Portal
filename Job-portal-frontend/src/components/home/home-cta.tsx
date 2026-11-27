import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function HomeCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#b9f36b] p-7 sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#48682d]">The right role is out there</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#19221d] sm:text-3xl">
            Let’s find the one that feels right.
          </h2>
        </div>
        <Link
          className="inline-flex h-11 items-center rounded-full bg-[#19221d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#344139]"
          to="/jobs"
        >
          Explore open roles <ArrowRight aria-hidden="true" className="ml-1" size={16} />
        </Link>
      </div>
    </section>
  )
}
