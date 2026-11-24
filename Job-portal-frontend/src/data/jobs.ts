export type Job = {
  id: string
  title: string
  company: string
  initials: string
  brandColor: string
  location: string
  type: string
  salary: string
  category: string
  posted: string
  featured?: boolean
  tags: string[]
}

export const jobs: Job[] = [
  {
    id: "product-designer",
    title: "Senior Product Designer",
    company: "Linear",
    initials: "L",
    brandColor: "#5146e5",
    location: "Remote",
    type: "Full-time",
    salary: "$120k – $160k",
    category: "Design",
    posted: "2 days ago",
    featured: true,
    tags: ["Product design", "Figma", "SaaS"],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    company: "Vercel",
    initials: "V",
    brandColor: "#171717",
    location: "New York, NY",
    type: "Full-time",
    salary: "$140k – $190k",
    category: "Engineering",
    posted: "1 day ago",
    featured: true,
    tags: ["React", "TypeScript", "Next.js"],
  },
  {
    id: "marketing-lead",
    title: "Growth Marketing Lead",
    company: "Notion",
    initials: "N",
    brandColor: "#282828",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$110k – $145k",
    category: "Marketing",
    posted: "3 days ago",
    tags: ["Growth", "Content", "B2B"],
  },
  {
    id: "data-analyst",
    title: "Product Data Analyst",
    company: "Figma",
    initials: "F",
    brandColor: "#f24e1e",
    location: "Remote",
    type: "Full-time",
    salary: "$105k – $135k",
    category: "Data",
    posted: "4 days ago",
    tags: ["SQL", "Analytics", "Product"],
  },
  {
    id: "customer-success",
    title: "Customer Success Manager",
    company: "Webflow",
    initials: "W",
    brandColor: "#146ef5",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$85k – $115k",
    category: "Customer Success",
    posted: "5 days ago",
    tags: ["Customer experience", "SaaS", "Strategy"],
  },
  {
    id: "visual-designer",
    title: "Brand & Visual Designer",
    company: "Stripe",
    initials: "S",
    brandColor: "#635bff",
    location: "Remote",
    type: "Contract",
    salary: "$80 – $110 / hr",
    category: "Design",
    posted: "1 week ago",
    tags: ["Brand", "Illustration", "Web"],
  },
]
