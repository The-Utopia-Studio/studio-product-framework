import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/product";

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/"
          aria-label="go home"
          className="mx-auto block w-fit font-semibold text-lg tracking-tight"
        >
          {PRODUCT_NAME}
        </Link>
        <span className="text-muted-foreground mt-8 block text-center text-sm">
          © {new Date().getFullYear()} {PRODUCT_NAME}
        </span>
        <span className="text-muted-foreground/70 mt-2 block text-center text-xs">
          Built with{" "}
          <Link
            href="https://github.com/The-Utopia-Studio/studio-product-framework"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary underline underline-offset-2"
          >
            Studio Product Framework
          </Link>
        </span>
      </div>
    </footer>
  );
}
