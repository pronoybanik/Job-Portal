import { ArrowRight, Search, Sparkles } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function HomeHero() {
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")
  const navigate = useNavigate()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set("q", keyword.trim())
    if (location.trim()) params.set("location", location.trim())
    navigate(`/jobs${params.size ? `?${params.toString()}` : ""}`)
  }

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-36 -top-32 size-[520px] rounded-full bg-[#eaf5dd] blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e3eadc] bg-white/80 px-3.5 py-2 text-xs font-medium text-[#52644a]">
            <Sparkles aria-hidden="true" className="text-[#82ad45]" size={14} />
            A better way to find your next role
          </div>
          <h1 className="max-w-2xl text-[clamp(3.2rem,7vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.075em] text-[#19221d]">
            Work that
            <br />
            <span className="text-[#73994c]">moves you.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#6e786f] sm:text-lg sm:leading-8">
            Meet the teams building what’s next. Find work that fits your goals, your strengths, and your life.
          </p>

          <form
            className="mt-9 flex flex-col gap-2 rounded-2xl border border-[#e5e9e2] bg-white p-2 shadow-[0_18px_50px_-32px_rgba(30,46,31,0.35)] sm:flex-row sm:items-center"
            id="job-search"
            onSubmit={handleSearch}
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:border-r sm:border-[#edf0eb]">
              <Search aria-hidden="true" className="shrink-0 text-[#829080]" size={19} />
              <span className="sr-only">Job title or keyword</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#a0a8a0]"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Job title or keyword"
                value={keyword}
              />
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
              <span aria-hidden="true" className="flex size-[19px] shrink-0 items-center justify-center text-[#829080]">
                <span className="size-2 rounded-full border-2 border-current" />
              </span>
              <span className="sr-only">City or remote</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#a0a8a0]"
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or remote"
                value={location}
              />
            </label>
            <Button className="h-12 rounded-xl bg-[#19221d] px-6 text-sm text-white hover:bg-[#344139]" type="submit">
              Search jobs <ArrowRight aria-hidden="true" className="ml-1" size={16} />
            </Button>
          </form>

          <p className="mt-4 text-xs text-[#879087]">
            Popular: <span className="text-[#5d695e]">Product designer, Remote, Software engineer</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto">
          <div className="absolute -left-7 top-12 z-10 hidden rounded-2xl border border-[#e8ece6] bg-white px-4 py-3 shadow-lg sm:block">
            <p className="text-xs text-[#778078]">New opportunities</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#233027]">2,400+ this week</p>
          </div>
          <div className="rounded-[2rem] bg-[#e8f0df] p-5 sm:p-7">
            <div className="rounded-[1.5rem] bg-[#d7e6c8] p-5 sm:p-7">
              <div className="relative flex aspect-[1.1/1] items-center justify-center overflow-hidden rounded-[1.25rem] bg-[#a7c58c]">
                <div aria-hidden="true" className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(#46663a 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#73994c]" style={{ clipPath: "polygon(0 60%, 28% 22%, 52% 55%, 76% 10%, 100% 48%, 100% 100%, 0 100%)" }} />
                <div aria-hidden="true" className="absolute bottom-[-18%] left-[14%] size-[67%] rotate-[-18deg] rounded-[45%] bg-[#f3c6a3] shadow-[inset_-18px_-12px_0_#e8aa84]" />
                <div aria-hidden="true" className="absolute bottom-[37%] left-[27%] h-[23%] w-[41%] rotate-[-20deg] rounded-[50%] bg-[#24392c]" />
                <div aria-hidden="true" className="absolute bottom-[24%] right-[8%] h-[24%] w-[26%] rotate-[14deg] rounded-t-full bg-[#e6a980]" />
                <div aria-hidden="true" className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-[#60833f] shadow-sm sm:right-6 sm:top-6">
                  <Sparkles aria-hidden="true" size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 right-3 rounded-2xl border border-[#e8ece6] bg-white px-4 py-3 shadow-lg sm:-right-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#d2a88f", "#8ba6a2", "#dbbd75"].map((color, index) => (
                  <span
                    aria-hidden="true"
                    className="size-8 rounded-full border-2 border-white"
                    key={color}
                    style={{ backgroundColor: color, zIndex: 3 - index }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-[#465248]">People found their fit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
