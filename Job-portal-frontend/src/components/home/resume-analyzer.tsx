import { Dialog } from "@base-ui/react/dialog"
import {
  Check,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { ResumeAnalysisResults, type ResumeAnalysis } from "./resume-analysis-results"

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "")

const scoreCategories = [
  { key: "formatting", label: "Formatting" },
  { key: "keywords", label: "Keywords" },
  { key: "structure", label: "Structure" },
  { key: "readability", label: "Readability" },
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isScoreDetail(
  value: unknown,
): value is ResumeAnalysis["scoreBreakdown"]["formatting"] {
  return (
    isRecord(value) &&
    typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    typeof value.feedback === "string"
  )
}

function isScoreBreakdown(value: unknown): value is ResumeAnalysis["scoreBreakdown"] {
  return (
    isRecord(value) &&
    scoreCategories.every(({ key }) => isScoreDetail(value[key]))
  )
}

function isResumeAnalysis(value: unknown): value is ResumeAnalysis {
  return (
    isRecord(value) &&
    typeof value.atsScore === "number" &&
    Number.isFinite(value.atsScore) &&
    value.atsScore >= 0 &&
    value.atsScore <= 100 &&
    isScoreBreakdown(value.scoreBreakdown) &&
    Array.isArray(value.suggestions) &&
    value.suggestions.every(
      (suggestion) =>
        isRecord(suggestion) &&
        typeof suggestion.category === "string" &&
        typeof suggestion.issue === "string" &&
        typeof suggestion.recommendation === "string" &&
        (suggestion.priority === "high" ||
          suggestion.priority === "medium" ||
          suggestion.priority === "low"),
    ) &&
    Array.isArray(value.strengths) &&
    value.strengths.every((strength) => typeof strength === "string") &&
    typeof value.summary === "string"
  )
}

function readPdfAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read the selected PDF. Please try again."))
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read the selected PDF. Please try again."))
        return
      }

      const separatorIndex = reader.result.indexOf(",")
      if (separatorIndex === -1) {
        reject(new Error("Could not prepare the selected PDF. Please try again."))
        return
      }

      resolve(reader.result.slice(separatorIndex + 1))
    }
    reader.readAsDataURL(file)
  })
}

export function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setAnalysis(null)
    setErrorMessage(null)
    setIsResultsOpen(false)
  }

  function removeFile() {
    setSelectedFile(null)
    setAnalysis(null)
    setErrorMessage(null)
    setIsResultsOpen(false)
  }

  async function analyzeResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFile || isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysis(null)
    setErrorMessage(null)

    try {
      if (selectedFile.size === 0) {
        throw new Error("The selected PDF is empty.")
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error("Resume PDF must be 10 MB or smaller.")
      }

      const signature = await selectedFile.slice(0, 4).text()
      if (signature !== "%PDF") {
        throw new Error("Please choose a valid PDF file.")
      }

      const pdf = await readPdfAsBase64(selectedFile)
      const response = await fetch(`${apiBaseUrl}/utils/resume-analyser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdf }),
      })

      let responseData: unknown
      try {
        responseData = await response.json()
      } catch {
        throw new Error("The resume service returned an invalid response. Please try again.")
      }

      if (!response.ok) {
        const message =
          isRecord(responseData) && typeof responseData.message === "string"
            ? responseData.message
            : "Unable to analyze your resume right now."
        throw new Error(message)
      }

      if (!isResumeAnalysis(responseData)) {
        throw new Error("The resume service returned incomplete results. Please try again.")
      }

      setAnalysis(responseData)
      setIsResultsOpen(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to analyze your resume right now.",
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="bg-[#f0f5eb]" id="resume-analyzer">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7d2] bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#52644a]">
              <Sparkles aria-hidden="true" className="text-[#82ad45]" size={14} />
              Resume Analyzer
            </span>
            <h2 className="mt-5 max-w-lg text-3xl font-semibold tracking-[-0.055em] text-[#19221d] sm:text-4xl">
              Make your resume work harder for you.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#727d73] sm:text-base">
              Upload your resume to get an ATS compatibility score, clear feedback, and practical
              improvements tailored to your document.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Check formatting, keywords, structure, and readability",
                "Get prioritized suggestions you can act on",
                "Review resume strengths and recommended improvements together",
              ].map((item) => (
                <li className="flex items-start gap-3 text-sm text-[#52644a]" key={item}>
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5f1d8] text-[#638843]">
                    <Check aria-hidden="true" size={13} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <form
            className="rounded-3xl border border-[#e0e8da] bg-white p-5 shadow-[0_24px_70px_-45px_rgba(37,54,34,0.35)] sm:p-8"
            onSubmit={analyzeResume}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eff8e5] text-[#638843]">
                <ShieldCheck aria-hidden="true" size={22} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#263128]">Get your resume reviewed</h3>
                <p className="mt-0.5 text-sm text-[#879087]">PDF files only · Up to 10 MB</p>
              </div>
            </div>

            <label
              className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dce7d2] bg-[#fbfcfa] px-5 py-7 text-center transition-colors hover:border-[#a9c58f] hover:bg-[#f7faf4] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              htmlFor="resume-pdf-input"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#638843] shadow-sm">
                <Upload aria-hidden="true" size={21} />
              </span>
              <span className="mt-3 text-sm font-semibold text-[#344b2d]">
                Choose a PDF resume
              </span>
              <span className="mt-1 text-xs text-[#879087]">Select a file from your device</span>
              <input
                accept="application/pdf,.pdf"
                className="sr-only"
                disabled={isAnalyzing}
                id="resume-pdf-input"
                onChange={handleFileChange}
                type="file"
              />
            </label>

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#e6ece2] bg-white p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f5eb] text-[#638843]">
                    <FileText aria-hidden="true" size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#344139]">{selectedFile.name}</p>
                    <p className="text-xs text-[#879087]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Remove selected resume"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#7c867d] transition-colors hover:bg-[#f2f5ef] hover:text-[#19221d] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isAnalyzing}
                  onClick={removeFile}
                  type="button"
                >
                  <X aria-hidden="true" size={17} />
                </button>
              </div>
            )}

            <button
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#19221d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#344139] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedFile || isAnalyzing}
              type="submit"
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle aria-hidden="true" className="mr-2 animate-spin" size={17} />
                  Analyzing resume...
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" className="mr-2" size={16} />
                  Analyze my resume
                </>
              )}
            </button>

            {errorMessage && (
              <p
                aria-live="assertive"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}
            {analysis && !isResultsOpen && (
              <button
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#dce3d8] bg-white px-5 text-sm font-semibold text-[#344b2d] transition-colors hover:bg-[#f5f8f2]"
                onClick={() => setIsResultsOpen(true)}
                type="button"
              >
                View analysis results
              </button>
            )}
          </form>
        </div>

        <Dialog.Root
          open={isResultsOpen && analysis !== null}
          onOpenChange={setIsResultsOpen}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-[#111711]/60 backdrop-blur-[2px] data-[open]:animate-in data-[open]:fade-in-0 data-[closed]:animate-out data-[closed]:fade-out-0" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-[#f0f5eb] p-3 shadow-2xl outline-none sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-4 px-2 sm:px-3">
                <div>
                  <Dialog.Title className="text-sm font-semibold text-[#344b2d]">
                    Resume analysis results
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    ATS score, resume strengths, and recommended improvements.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label="Close resume analysis results"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#7c867d] transition-colors hover:bg-white hover:text-[#19221d]"
                >
                  <X aria-hidden="true" size={18} />
                </Dialog.Close>
              </div>
              {analysis && <ResumeAnalysisResults analysis={analysis} />}
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>
  )
}
