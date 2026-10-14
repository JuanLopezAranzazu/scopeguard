import type { Project } from "./types";

export interface Sample {
  id: string;
  title: string;
  blurb: string;
  tests: string;
  project: Project;
  request: string;
}

export const samples: Sample[] = [
  {
    id: "web",
    title: "Website scope expansion",
    blurb:
      "A client requests an order dashboard, email notifications, and a statistics page for a website.",
    tests: "Tests: explicit exclusions",
    project: {
      name: "Business Website",
      client: "Client A",
      owner: "",
      deliverables: ["5-page website", "Contact form"],
      features: ["Mobile-friendly design"],
      exclusions: [
        "Online store and admin dashboard are not included",
      ],
      budget: 1200,
      currency: "USD",
      hourly_rate: 30,
      deadline: "6 weeks from design approval",
      notes: "",
    },
    request:
      "Hi! The site looks great. Could you also add a dashboard to manage orders, set up email notifications, and build a statistics page? It's something simple, right?",
  },
  {
    id: "brand",
    title: "Additional design revisions",
    blurb:
      "A client requests an extra revision and additional logo formats beyond the original agreement.",
    tests: "Tests: ambiguity",
    project: {
      name: "Brand Identity Design",
      client: "Client B",
      owner: "",
      deliverables: [
        "Primary logo",
        "Color palette",
        "Brand typefaces",
      ],
      features: ["Two rounds of revisions"],
      exclusions: [],
      budget: 600,
      currency: "USD",
      hourly_rate: 25,
      deadline: "3 weeks",
      notes: "",
    },
    request:
      "We've used both revisions, but I'd love one more because I'm not fully convinced by the design. Also, could you adapt the logo so it looks good on social media?",
  },
  {
    id: "inscope",
    title: "Requested improvements",
    blurb:
      "A client asks for mobile compatibility and card payments, both already included in the agreement.",
    tests: "Tests: in-scope detection",
    project: {
      name: "E-commerce Website",
      client: "Client C",
      owner: "",
      deliverables: [
        "Online store with 20 products",
        "Contact form",
      ],
      features: [
        "Mobile-friendly design",
        "Credit card payment gateway",
      ],
      exclusions: [
        "Copywriting and product photography are not included",
      ],
      budget: 1800,
      currency: "USD",
      hourly_rate: 30,
      deadline: "5 weeks",
      notes: "",
    },
    request:
      "Hey, can you make sure the store looks good on mobile and that card payments work on every product?",
  },
];
