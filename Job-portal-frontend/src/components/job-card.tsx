import { ArrowUpRight, Bookmark, MapPin } from "lucide-react"
import { useState } from "react"

import type { Job } from "@/data/jobs"

type JobCardProps = {
  job: Job
  compact?: boolean
}

export function JobCard({ job, compact = false }: JobCardProps) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="group rounded-2xl border border-[#e8ece6] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#d1d9ce] hover:shadow-[0_12px_35px_-24px_rgba(27,39,29,0.35)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-label={`${job.company} logo`}
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: job.brandColor }}
          >
            {job.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#27312a]">{job.company}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#818a82]">
              <MapPin aria-hidden="true" size={13} /> {job.location}
            </p>
          </div>
        </div>
        <button
          aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
          aria-pressed={saved}
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors ${saved ? "border-[#b9f36b] bg-[#effbdd] text-[#426423]" : "border-[#e8ece6] text-[#7b857c] hover:bg-[#f5f7f3]"}`}
          onClick={() => setSaved(!saved)}
          type="button"
        >
          <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} size={16} />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          {job.featured && (
            <span className="rounded-full bg-[#effbdd] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4c702c]">
              Featured
            </span>
          )}
          <span className="text-xs text-[#929a93]">{job.posted}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.035em] text-[#19221d]">
          {job.title}
        </h3>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#f4f6f2] px-2.5 py-1 text-xs text-[#68736a]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] pt-4">
        <div>
          <p className="text-sm font-semibold text-[#263128]">{job.salary}</p>
          <p className="mt-0.5 text-xs text-[#899189]">{job.type}</p>
        </div>
        <a
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#344b2d] transition-colors hover:text-[#648e3b]"
          href={`mailto:careers@${job.company.toLowerCase()}.example?subject=${encodeURIComponent(job.title)}`}
        >
          Apply <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </div>
    </article>
  )
}
