import { Link } from "react-router";

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link to="/" aria-label="go home" className="mx-auto block size-fit">
          <img
            src="/favicon.png"
            alt="Studio Product Framework"
            className="h-12 w-12"
          />
        </Link>
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            to="https://github.com/karanmjpinto/studio-product-framework"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-primary block"
          >
            <svg
              className="size-6"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49c.5.09.682-.217.682-.482c0-.237-.008-.866-.013-1.7c-2.782.603-3.369-1.34-3.369-1.34c-.454-1.156-1.11-1.464-1.11-1.464c-.908-.62.069-.608.069-.608c1.003.07 1.531 1.03 1.531 1.03c.892 1.529 2.341 1.087 2.91.832c.092-.647.35-1.088.636-1.338c-2.22-.253-4.555-1.11-4.555-4.943c0-1.091.39-1.984 1.029-2.683c-.103-.253-.446-1.27.098-2.647c0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336c1.909-1.294 2.747-1.025 2.747-1.025c.546 1.377.203 2.394.1 2.647c.64.699 1.028 1.592 1.028 2.683c0 3.842-2.339 4.687-4.566 4.935c.359.309.678.919.678 1.852c0 1.336-.012 2.415-.012 2.743c0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10"
              ></path>
            </svg>
          </Link>
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          © {new Date().getFullYear()} Studio Product Framework
        </span>
      </div>
    </footer>
  );
}
