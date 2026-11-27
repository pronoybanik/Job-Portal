import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

import { JobCard } from "@/components/job-card"
import { jobs } from "@/data/jobs"

export function FeaturedJobs() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20" id="how-it-works">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789650]">Curated for you</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-[#19221d] sm:text-4xl">
            Make your next move.
          </h2>
          <p className="mt-2 text-sm text-[#7c867d]">A few good places to start your search.</p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#344b2d] hover:text-[#648e3b]" to="/jobs">
          See all jobs <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.slice(0, 3).map((job) => (
          <JobCard job={job} key={job.id} />
        ))}
      </div>
    </section>
  )
}
