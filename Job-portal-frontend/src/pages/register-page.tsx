import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/components/auth/auth-layout"
import { getApiErrorMessage } from "@/lib/api-error"
import { useRegisterMutation } from "@/services/auth-api"
import { setCredentials } from "@/store/auth-slice"
import type { AppDispatch } from "@/store/store"

type AccountType = "job_seeker" | "recruiter"

export function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("job_seeker")
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState("")
  const [isError, setIsError] = useState(false)
  const [register, { isLoading }] = useRegisterMutation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (formData.get("password") !== formData.get("confirm-password")) {
      setNotice("Those passwords don’t match. Please check and try again.")
      setIsError(true)
      return
    }

    setNotice("")
    setIsError(false)

    try {
      const result = await register({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role: accountType === "job_seeker" ? "JOB_SEEKER" : "RECRUITER",
      }).unwrap()
      localStorage.setItem("token", result.token)
      dispatch(setCredentials(result))
      navigate("/", { replace: true })
    } catch (error) {
      setNotice(
        getApiErrorMessage(
          error,
          "Unable to create your account. Please try again."
        )
      )
      setIsError(true)
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-[#789650] uppercase">
          Get started for free
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#19221d] sm:text-4xl">
          Create your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7c867d]">
          Tell us how you’ll use Workly and we’ll make yourself at home.
        </p>
      </div>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-sm font-medium text-[#344139]">
            I’m here to
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "job_seeker",
                  label: "Find a job",
                  detail: "Explore new roles",
                },
                {
                  value: "recruiter",
                  label: "Hire talent",
                  detail: "Build my team",
                },
              ] as const
            ).map((option) => (
              <label
                className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                  accountType === option.value
                    ? "border-[#9dbb80] bg-[#f4f8ef] ring-2 ring-[#eaf3df]"
                    : "border-[#e1e7de] bg-white hover:border-[#cbd8c2]"
                }`}
                key={option.value}
              >
                <input
                  checked={accountType === option.value}
                  className="sr-only"
                  name="account-type"
                  onChange={() => setAccountType(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className="block text-sm font-semibold text-[#263128]">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs text-[#899289]">
                  {option.detail}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            className="text-sm font-medium text-[#344139]"
            htmlFor="register-name"
          >
            Full name
          </label>
          <div className="relative mt-1.5">
            <UserRound
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#98a197]"
              size={17}
            />
            <input
              autoComplete="name"
              className="h-11 w-full rounded-xl border border-[#e1e7de] bg-white pr-4 pl-10 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
              id="register-name"
              name="name"
              placeholder="Your name"
              required
            />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-[#344139]"
            htmlFor="register-email"
          >
            Email address
          </label>
          <div className="relative mt-1.5">
            <Mail
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#98a197]"
              size={17}
            />
            <input
              autoComplete="email"
              className="h-11 w-full rounded-xl border border-[#e1e7de] bg-white pr-4 pl-10 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
              id="register-email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-[#344139]"
              htmlFor="register-password"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <LockKeyhole
                aria-hidden="true"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[#98a197]"
                size={16}
              />
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-[#e1e7de] bg-white pr-10 pl-9 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
                id="register-password"
                minLength={8}
                name="password"
                placeholder="8+ characters"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#899289] transition-colors hover:bg-[#f4f6f2] hover:text-[#465248]"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={16} />
                ) : (
                  <Eye aria-hidden="true" size={16} />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              className="text-sm font-medium text-[#344139]"
              htmlFor="register-confirm-password"
            >
              Confirm password
            </label>
            <input
              autoComplete="new-password"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#e1e7de] bg-white px-3 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
              id="register-confirm-password"
              minLength={8}
              name="confirm-password"
              placeholder="Re-enter password"
              required
              type={showPassword ? "text" : "password"}
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-5 text-[#7c867d]">
          <input
            className="mt-1 size-3.5 accent-[#73994c]"
            name="terms"
            required
            type="checkbox"
          />
          <span>
            I agree to the{" "}
            <span className="font-medium text-[#52644a]">Terms of Service</span>{" "}
            and{" "}
            <span className="font-medium text-[#52644a]">Privacy Policy</span>.
          </span>
        </label>

        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#19221d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#344139] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789650] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Creating account..." : "Create account"}
          {!isLoading && (
            <ArrowRight aria-hidden="true" className="ml-2" size={16} />
          )}
        </button>

        {notice && (
          <p
            aria-live="polite"
            className={`rounded-lg px-3 py-2.5 text-xs leading-5 ${
              isError ? "bg-red-50 text-red-700" : "bg-[#f0f5eb] text-[#52644a]"
            }`}
          >
            {notice}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-[#7c867d]">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[#344b2d] transition-colors hover:text-[#648e3b]"
          to="/login"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-5 text-center text-[11px] leading-5 text-[#a0a8a0]">
        Your account helps you make the most of Workly.
      </p>
    </AuthLayout>
  )
}
