import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { HomePage } from "@/pages/home-page"
import { JobsPage } from "@/pages/jobs-page"

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col bg-[#fafbf8] text-[#19221d]">
        <SiteHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
