import { ArrowRight, BriefcaseBusiness, Check, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

interface ScoreDetail {
  score: number
  feedback: string
}

export interface ResumeAnalysis {
  atsScore: number
  scoreBreakdown: {
    formatting: ScoreDetail
    keywords: ScoreDetail
    structure: ScoreDetail
    readability: ScoreDetail
  }
  suggestions: {
    category: string
    issue: string
    recommendation: string
    priority: "high" | "medium" | "low"
  }[]
  strengths: string[]
  summary: string
}

interface ResumeAnalysisResultsProps {
  analysis: ResumeAnalysis
}

const scoreCategories = [
  { key: "formatting", label: "Formatting" },
  { key: "keywords", label: "Keywords" },
  { key: "structure", label: "Structure" },
  { key: "readability", label: "Readability" },
] as const

function getPriorityStyles(priority: ResumeAnalysis["suggestions"][number]["priority"]) {
  if (priority === "high") return "bg-red-50 text-red-700"
  if (priority === "medium") return "bg-amber-50 text-amber-700"
  return "bg-[#eff8e5] text-[#526f35]"
}

export function ResumeAnalysisResults({ analysis }: ResumeAnalysisResultsProps) {
  return (
    <section
      aria-labelledby="resume-analysis-results-title"
      aria-live="polite"
      className="rounded-3xl border border-[#dce8d3] bg-white p-5 shadow-[0_24px_70px_-52px_rgba(37,54,34,0.35)] sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-5 border-b border-[#edf0eb] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#73994c]">
            Resume analysis
          </p>
          <h3
            className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#19221d]"
            id="resume-analysis-results-title"
          >
            Your ATS results
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68736a]">{analysis.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#f5f8f2] px-5 py-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#e5f1d8] text-[#4c702c]">
            <Sparkles aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="text-2xl font-bold leading-none text-[#344b2d]">
              {analysis.atsScore}
              <span className="ml-1 text-sm font-medium text-[#879087]">/100</span>
            </p>
            <p className="mt-1 text-xs font-medium text-[#68736a]">ATS compatibility</p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h4 className="text-base font-semibold text-[#263128]">Score breakdown</h4>
          <div className="mt-4 space-y-5">
            {scoreCategories.map(({ key, label }) => {
              const detail = analysis.scoreBreakdown[key]
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#465248]">{label}</span>
                    <span className="text-sm font-semibold text-[#344b2d]">{detail.score}/100</span>
                  </div>
                  <div
                    aria-label={`${label} score: ${detail.score} out of 100`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={detail.score}
                    className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf1e9]"
                    role="meter"
                  >
                    <div
                      className="h-full rounded-full bg-[#82ad45] transition-[width]"
                      style={{ width: `${detail.score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#7c867d]">{detail.feedback}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-[#e1ead9] bg-[#fbfcfa] p-5">
            <h4 className="text-base font-semibold text-[#344b2d]">What’s working well</h4>
            {analysis.strengths.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {analysis.strengths.map((strength) => (
                  <li className="flex gap-2 text-sm leading-6 text-[#52644a]" key={strength}>
                    <Check aria-hidden="true" className="mt-1 shrink-0 text-[#73994c]" size={15} />
                    {strength}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[#7c867d]">
                No specific strengths were returned for this resume.
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-[#263128]">Recommended improvements</h4>
          {analysis.suggestions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <article
                  className="rounded-2xl border border-[#e6ece2] p-4"
                  key={`${suggestion.category}-${index}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold text-[#344139]">{suggestion.category}</h5>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getPriorityStyles(suggestion.priority)}`}
                    >
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#68736a]">{suggestion.issue}</p>
                  <p className="mt-2 text-sm leading-6 text-[#344b2d]">
                    <span className="font-semibold">Try this:</span> {suggestion.recommendation}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-[#f5f8f2] p-4 text-sm leading-6 text-[#68736a]">
              No specific improvements were returned. Your resume may already be in good shape.
            </p>
          )}
        </div>
      </div>

      <Link
        className="mt-8 inline-flex h-11 items-center rounded-full bg-[#19221d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#344139]"
        to="/jobs"
      >
        Explore open roles <ArrowRight aria-hidden="true" className="ml-2" size={16} />
        <BriefcaseBusiness aria-hidden="true" className="ml-2" size={15} />
      </Link>
    </section>
  )
}
