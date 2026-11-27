import { CareerGuide } from "@/components/home/career-guide"
import { FeaturedJobs } from "@/components/home/featured-jobs"
import { HomeCta } from "@/components/home/home-cta"
import { HomeHero } from "@/components/home/home-hero"
import { JobCategories } from "@/components/home/job-categories"
import { QuickStart } from "@/components/home/quick-start"
import { ResumeAnalyzer } from "@/components/home/resume-analyzer"

export function HomePage() {
  return (
    <>
      <HomeHero />
      <QuickStart />
      <FeaturedJobs />
      <JobCategories />
      <CareerGuide />
      <ResumeAnalyzer />
      <HomeCta />
    </>
  )
}
