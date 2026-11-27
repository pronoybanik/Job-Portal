import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

const categories = [
  { name: "Design", count: "1.2k" },
  { name: "Engineering", count: "2.8k" },
  { name: "Marketing", count: "840" },
  { name: "Data", count: "560" },
]

export function JobCategories() {
  return (
    <section className="bg-[#f0f5eb]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789650]">Find your corner</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-[#19221d] sm:text-4xl">
              Explore by category.
            </h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#344b2d] hover:text-[#648e3b]" to="/jobs">
            Browse every category <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              className="group flex items-center justify-between rounded-2xl border border-[#e0e9d8] bg-white/75 p-5 transition-all hover:-translate-y-0.5 hover:bg-white"
              key={category.name}
              to={`/jobs?category=${encodeURIComponent(category.name)}`}
            >
              <div>
                <p className="font-semibold text-[#263128]">{category.name}</p>
                <p className="mt-1 text-xs text-[#899289]">{category.count} open positions</p>
              </div>
              <ArrowUpRight aria-hidden="true" className="text-[#7b9370] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={18} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
