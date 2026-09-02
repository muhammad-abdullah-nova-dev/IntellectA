import Link from "next/link";
import { Github } from "lucide-react";
import { IntellectAWordmark } from "@/components/brand/intellecta-logo";

const GITHUB_REPO = "https://github.com/muhammad-abdullah-nova-dev/IntellectA";

const PRODUCT_LINKS = [
  { href: "/login", label: "Get started" },
  { href: "/chat", label: "Chat workspace" },
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

const SUBJECT_LINKS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];

const MORE_SUBJECTS = [
  "History",
  "Politics",
  "Geography",
  "Economics",
];

export function DockitFooter() {
  return (
    <footer className="dockit-footer">
      <div className="dockit-container">
        <div className="footer-top">
          <div className="footer-col">
            <p className="footer-col-title">Product</p>
            <ul className="footer-links">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Subjects</p>
            <ul className="footer-links">
              {SUBJECT_LINKS.map((label) => (
                <li key={label}>
                  <a href="#subjects" className="footer-link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">More</p>
            <ul className="footer-links">
              {MORE_SUBJECTS.map((label) => (
                <li key={label}>
                  <a href="#subjects" className="footer-link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-col--brand">
            <p className="footer-col-title">Connect</p>
            <div className="footer-brand">
              <IntellectAWordmark width={118} className="h-7" />
              <p className="footer-tagline">
                Your AI study companion — eight subject experts, one workspace,
                built for students.
              </p>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-github-btn"
              >
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} IntellectA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
