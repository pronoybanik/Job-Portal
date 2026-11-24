import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"

import { JobCard } from "@/components/job-card"
import { jobs } from "@/data/jobs"

const categories = ["All jobs", "Engineering", "Design", "Marketing", "Data", "Customer Success"]

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "All jobs")
  const [remoteOnly, setRemoteOnly] = useState(false)

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    const normalizedLocation = location.trim().toLowerCase()

    return jobs.filter((job) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [job.title, job.company, job.category, ...job.tags].some((value) =>
          value.toLowerCase().includes(normalizedKeyword),
        )
      const matchesLocation =
        !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation)
      const matchesCategory = category === "All jobs" || job.category === category
      const matchesRemote = !remoteOnly || job.location.toLowerCase() === "remote"

      return matchesKeyword && matchesLocation && matchesCategory && matchesRemote
    })
  }, [category, keyword, location, remoteOnly])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set("q", keyword.trim())
    if (location.trim()) params.set("location", location.trim())
    if (category !== "All jobs") params.set("category", category)
    setSearchParams(params)
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory)
    const params = new URLSearchParams(searchParams)
    if (nextCategory === "All jobs") params.delete("category")
    else params.set("category", nextCategory)
    setSearchParams(params)
  }

  function clearFilters() {
    setKeyword("")
    setLocation("")
    setCategory("All jobs")
    setRemoteOnly(false)
    setSearchParams({})
  }

  const hasFilters = Boolean(keyword || location || category !== "All jobs" || remoteOnly)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789650]">Find your fit</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.065em] text-[#19221d] sm:text-5xl">
          Explore open roles.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#748076] sm:text-base">
          Thoughtful teams, meaningful work, and a better next step — all in one place.
        </p>
      </div>

      <form
        className="mt-8 grid gap-2 rounded-2xl border border-[#e5e9e2] bg-white p-2 shadow-[0_12px_40px_-32px_rgba(30,46,31,0.3)] sm:grid-cols-[1fr_0.75fr_auto]"
        onSubmit={handleSearch}
      >
        <label className="flex min-w-0 items-center gap-3 px-3 py-2">
          <Search aria-hidden="true" className="shrink-0 text-[#829080]" size={18} />
          <span className="sr-only">Job title or keyword</span>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#a0a8a0]"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Job title, skill, or company"
            value={keyword}
          />
        </label>
        <label className="flex min-w-0 items-center gap-3 border-[#edf0eb] px-3 py-2 sm:border-l">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full border-2 border-[#829080]" />
          <span className="sr-only">City or remote</span>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#a0a8a0]"
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City or remote"
            value={location}
          />
        </label>
        <button
          className="h-11 rounded-xl bg-[#19221d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#344139]"
          type="submit"
        >
          Search
        </button>
      </form>

      <div className="mt-9 flex flex-col gap-5 border-b border-[#e9ede7] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div aria-label="Filter jobs by category" className="flex gap-2 overflow-x-auto pb-1" role="group">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${category === item ? "bg-[#19221d] text-white" : "border border-[#e5e9e2] bg-white text-[#707b71] hover:bg-[#f2f5ef]"}`}
              key={item}
              onClick={() => selectCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <button
          aria-pressed={remoteOnly}
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${remoteOnly ? "border-[#c9ddb9] bg-[#effbdd] text-[#4c702c]" : "border-[#e5e9e2] bg-white text-[#68736a] hover:bg-[#f2f5ef]"}`}
          onClick={() => setRemoteOnly(!remoteOnly)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={14} />
          Remote only
        </button>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.035em] text-[#27312a]">Recommended jobs</h2>
          <p aria-live="polite" className="mt-1 text-xs text-[#899189]">
            Showing {filteredJobs.length} of {jobs.length} opportunities
          </p>
        </div>
        <button className="inline-flex items-center gap-2 text-xs font-medium text-[#778178]" type="button">
          <ArrowUpDown aria-hidden="true" size={14} />
          Most relevant
        </button>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard job={job} key={job.id} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce4d8] bg-white px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#effbdd] text-[#658642]">
            <Search aria-hidden="true" size={20} />
          </span>
          <h3 className="mt-4 font-semibold text-[#27312a]">No jobs match those filters</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-[#818a82]">
            Try a different keyword or location, or clear your filters to see every opportunity.
          </p>
          {hasFilters && (
            <button
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4b6638] hover:text-[#73994c]"
              onClick={clearFilters}
              type="button"
            >
              <X aria-hidden="true" size={15} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
