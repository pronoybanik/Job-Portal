import { Link } from "react-router-dom"

const quickLinks = ["All roles", "Remote-first", "Flexible", "Early-stage"]

export function QuickStart() {
  return (
    <section className="border-y border-[#e9ede7] bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-semibold tracking-wide text-[#848e85]">A GOOD PLACE TO START</p>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              className="rounded-full border border-[#e7ebe4] px-3.5 py-2 text-xs font-medium text-[#59645b] transition-colors hover:border-[#cbd8c2] hover:bg-[#f4f8ef]"
              key={item}
              to={`/jobs?q=${encodeURIComponent(item === "All roles" ? "" : item)}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
