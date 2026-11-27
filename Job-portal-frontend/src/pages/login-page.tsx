import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/components/auth/auth-layout"
import { getApiErrorMessage } from "@/lib/api-error"
import { useLoginMutation } from "@/services/auth-api"
import { setCredentials } from "@/store/auth-slice"
import type { AppDispatch } from "@/store/store"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState("")
  const [isError, setIsError] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice("")
    setIsError(false)
    const formData = new FormData(event.currentTarget)

    try {
      const result = await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }).unwrap()
      localStorage.setItem("token", result.token)
      dispatch(setCredentials(result))
      navigate("/", { replace: true })
    } catch (error) {
      setNotice(
        getApiErrorMessage(error, "Unable to sign in. Please try again.")
      )
      setIsError(true)
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-[#789650] uppercase">
          Welcome back
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#19221d] sm:text-4xl">
          Sign in to Workly
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7c867d]">
          Pick up where you left off and find your next opportunity.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-[#344139]"
            htmlFor="login-email"
          >
            Email address
          </label>
          <div className="relative mt-2">
            <Mail
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#98a197]"
              size={17}
            />
            <input
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-[#e1e7de] bg-white pr-4 pl-10 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
              id="login-email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-medium text-[#344139]"
              htmlFor="login-password"
            >
              Password
            </label>
            <button
              className="text-xs font-medium text-[#648e3b] transition-colors hover:text-[#344b2d]"
              onClick={() => {
                setNotice("Password recovery is not available yet.")
                setIsError(false)
              }}
              type="button"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-2">
            <LockKeyhole
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#98a197]"
              size={17}
            />
            <input
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-[#e1e7de] bg-white pr-12 pl-10 text-sm text-[#263128] transition outline-none focus:border-[#a9c58f] focus:ring-4 focus:ring-[#eaf3df]"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#899289] transition-colors hover:bg-[#f4f6f2] hover:text-[#465248]"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={17} />
              ) : (
                <Eye aria-hidden="true" size={17} />
              )}
            </button>
          </div>
        </div>

        <button
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#19221d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#344139] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789650] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Signing in..." : "Sign in"}
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

      <p className="mt-7 text-center text-sm text-[#7c867d]">
        New to Workly?{" "}
        <Link
          className="font-semibold text-[#344b2d] transition-colors hover:text-[#648e3b]"
          to="/register"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-8 text-center text-[11px] leading-5 text-[#a0a8a0]">
        Sign in securely to continue your job search.
      </p>
    </AuthLayout>
  )
}
