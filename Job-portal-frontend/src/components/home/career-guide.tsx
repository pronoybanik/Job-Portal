import { Dialog } from "@base-ui/react/dialog"
import { ArrowRight, BriefcaseBusiness, Check, Plus, Sparkles, X } from "lucide-react"
import { useState, type FormEvent, type KeyboardEvent } from "react"
import { Link } from "react-router-dom"
import careerGuidanceIllustration from "../../assets/career-guidance-illustration.svg"

interface CareerGuidance {
  summary: string
  jobOptions: {
    title: string
    responsibilities: string
    why: string
  }[]
  skillsToLearn: {
    category: string
    skills: {
      title: string
      why: string
      how: string
    }[]
  }[]
  learningApproach: {
    title: string
    points: string[]
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "")

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasStringFields(value: unknown, fields: string[]): value is Record<string, unknown> {
  return isRecord(value) && fields.every((field) => typeof value[field] === "string")
}

function isCareerGuidance(value: unknown): value is CareerGuidance {
  return (
    hasStringFields(value, ["summary"]) &&
    Array.isArray(value.jobOptions) &&
    value.jobOptions.every((option) => hasStringFields(option, ["title", "responsibilities", "why"])) &&
    Array.isArray(value.skillsToLearn) &&
    value.skillsToLearn.every(
      (category) =>
        hasStringFields(category, ["category"]) &&
        Array.isArray(category.skills) &&
        category.skills.every((skill) => hasStringFields(skill, ["title", "why", "how"])),
    ) &&
    isRecord(value.learningApproach) &&
    typeof value.learningApproach.title === "string" &&
    Array.isArray(value.learningApproach.points) &&
    value.learningApproach.points.every((point) => typeof point === "string")
  )
}

export function CareerGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  function addSkill(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const skill = skillInput.trim()
    if (
      isGenerating ||
      !skill ||
      skills.some((existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase())
    ) {
      return
    }

    setSkills((currentSkills) => [...currentSkills, skill])
    setSkillInput("")
    setGuidance(null)
    setErrorMessage(null)
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      addSkill()
    }
  }
  function removeSkill(skillToRemove: string) {
    if (isGenerating) return
    setSkills((currentSkills) => currentSkills.filter((skill) => skill !== skillToRemove))
    setGuidance(null)
    setErrorMessage(null)
  }

  async function generateGuidance() {
    if (skills.length === 0 || isGenerating) return

    setIsGenerating(true)
    setGuidance(null)
    setErrorMessage(null)

    try {
      const response = await fetch(`${apiBaseUrl}/utils/career`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: skills.join(", ") }),
      })

      let responseData: unknown
      try {
        responseData = await response.json()
      } catch {
        throw new Error("The career service returned an invalid response. Please try again.")
      }

      if (!response.ok) {
        const message =
          isRecord(responseData) && typeof responseData.message === "string"
            ? responseData.message
            : "Unable to generate career guidance right now."
        throw new Error(message)
      }

      if (!isCareerGuidance(responseData)) {
        throw new Error("The career service returned incomplete guidance. Please try again.")
      }

      setGuidance(responseData)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to generate career guidance right now.",
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="bg-[#f0f5eb]" id="career-guide">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e1ead9] bg-white px-6 py-10 shadow-[0_24px_70px_-52px_rgba(37,54,34,0.35)] sm:px-10 sm:py-12 lg:px-14">
          <div aria-hidden="true" className="absolute -right-20 -top-32 size-80 rounded-full bg-[#eff8e5] blur-3xl" />
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 hidden w-44 opacity-60 lg:block xl:right-8 xl:top-5 xl:w-56"
            src={careerGuidanceIllustration}
          />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 nded-full border border-[#e3eadc] bg-[#fafcf8] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#52644a]">
              <Sparkles aria-hidden="true" className="text-[#82ad45]" size={15} />
              Career guidance
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.055em] text-[#19221d] sm:text-4xl">
              Find a career path that fits you.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#7c867d] sm:text-base">
              Tell us what you’re good at and get practical ideas for your next move.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#68736a]">
              <span className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="text-[#73994c]" size={16} />
                Free to use
              </span>
              <span className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="text-[#73994c]" size={16} />
                Suggestions based on your skills
              </span>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex h-11 items-center rounded-xl bg-[#19221d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#344139]"
                to="/jobs"
              >
                Browse jobs <ArrowRight aria-hidden="true" className="ml-2" size={16} />
              </Link>
              <a
                className="inline-flex h-11 items-center rounded-xl border border-[#e5e9e2] bg-white px-5 text-sm font-medium text-[#465248] transition-colors hover:bg-[#f5f8f2]"
                href="#resume-analyzer"
              >
                Learn more
              </a>
            </div>

            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
              <Dialog.Trigger
                className="mt-7 inline-flex h-12 items-center rounded-xl bg-[#19221d] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#344139] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789650]"
              >
                <Sparkles aria-hidden="true" className="mr-2" size={16} />
                Get Career Guidance <ArrowRight aria-hidden="true" className="ml-2" size={16} />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-40 bg-[#111711]/55 backdrop-blur-[2px] data-[open]:animate-in data-[open]:fade-in-0 data-[closed]:animate-out data-[closed]:fade-out-0" />
                <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#e8ece6] bg-white p-5 shadow-2xl outline-none sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="flex items-center gap-2 text-xl font-semibold tracking-[-0.04em] text-[#19221d]">
                        <Sparkles aria-hidden="true" className="text-[#73994c]" size={20} />
                        Tell us about your skills
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 text-sm leading-6 text-[#7c867d]">
                        Add your skills to get personalized career recommendations.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close
                      aria-label="Close career guidance"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#7c867d] transition-colors hover:bg-[#f2f5ef] hover:text-[#19221d]"
                    >
                      <X aria-hidden="true" size={18} />
                    </Dialog.Close>
                  </div>

                  <form className="mt-6" onSubmit={addSkill}>
                    <label className="text-xs font-semibold text-[#465248]" htmlFor="career-skill-input">
                      Add skills
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        autoComplete="off"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-[#dce3d8] bg-white px-3 text-sm text-[#263128] outline-none transition-shadow placeholder:text-[#a0a8a0] focus:border-[#a9c58f] focus:ring-2 focus:ring-[#eaf3df]"
                        disabled={isGenerating}
                        id="career-skill-input"
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="e.g., React, Node.js, Python..."
                        value={skillInput}
                      />
                      <button
                        className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#19221d] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#344139] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!skillInput.trim() || isGenerating}
                        type="submit"
                      >
                        <Plus aria-hidden="true" size={15} />
                        Add
                      </button>
                    </div>
                  </form>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-[#465248]">Your Skills ({skills.length})</p>
                    {skills.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <li
                            className="inline-flex items-center gap-2 rounded-full border border-[#d8e6f4] bg-[#eaf3ff] py-1.5 pl-3 pr-1.5 text-xs font-medium text-[#344b66]"
                            key={skill}
                          >
                            {skill}
                            <button
                              aria-label={`Remove ${skill}`}
                              className="flex size-5 items-center justify-center rounded-full bg-[#e4565a] text-white transition-colors hover:bg-[#c93c42]"
                              onClick={() => removeSkill(skill)}
                              disabled={isGenerating}
                              type="button"
                            >
                              <X aria-hidden="true" size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#879087]">Add a skill to get started.</p>
                    )}
                  </div>

                  <button
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#19221d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#344139] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={skills.length === 0 || isGenerating}
                    onClick={generateGuidance}
                    type="button"
                  >
                    <Sparkles aria-hidden="true" className="mr-2" size={16} />
                    {isGenerating ? "Generating recommendations..." : "Generate Career Guidance"}
                  </button>

                  {errorMessage && (
                    <p aria-live="assertive" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  )}

                  {guidance && (
                    <div aria-live="polite" className="mt-5 rounded-xl border border-[#dce8d3] bg-[#f5f8f2] p-4">
                      <p className="text-sm font-semibold text-[#344b2d]">Your career outlook</p>
                      <p className="mt-1 text-xs leading-5 text-[#68736a]">{guidance.summary}</p>

                      <div className="mt-4 space-y-3">
                        {guidance.jobOptions.map((job) => (
                          <article className="rounded-lg border border-[#e1ead9] bg-white p-3" key={job.title}>
                            <h3 className="text-sm font-semibold text-[#263128]">{job.title}</h3>
                            <p className="mt-1 text-xs leading-5 text-[#68736a]">{job.responsibilities}</p>
                            <p className="mt-2 text-xs leading-5 text-[#52644a]">
                              <span className="font-semibold">Why it fits:</span> {job.why}
                            </p>
                          </article>
                        ))}
                      </div>

                      {guidance.skillsToLearn.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-[#344b2d]">Skills to develop</h3>
                          {guidance.skillsToLearn.map((category) => (
                            <div className="mt-3" key={category.category}>
                              <h4 className="text-xs font-semibold text-[#465248]">{category.category}</h4>
                              <ul className="mt-2 space-y-2">
                                {category.skills.map((skill) => (
                                  <li className="text-xs leading-5 text-[#68736a]" key={skill.title}>
                                    <span className="font-semibold text-[#344b2d]">{skill.title}:</span>{" "}
                                    {skill.why} {skill.how}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-[#344b2d]">{guidance.learningApproach.title}</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[#68736a]">
                          {guidance.learningApproach.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#344b2d] hover:text-[#648e3b]"
                        onClick={() => setIsOpen(false)}
                        to="/jobs"
                      >
                        Browse matching opportunities <BriefcaseBusiness aria-hidden="true" size={14} />
                      </Link>
                    </div>
                  )}
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>
    </section>
  )
}
