import { redirect } from "next/navigation";

// Not just hidden from the sidebar — visiting the URL directly should bounce
// away too, since Convex's runMeteredInference throws immediately without
// OPENROUTER_API_KEY configured.
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    redirect("/dashboard");
  }

  return children;
}
