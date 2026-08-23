import fs from "node:fs";
import path from "node:path";

// Reads the actual applied brand color out of globals.css rather than
// hardcoding one, so generated icons/OG images stay correct after the setup
// wizard's design-system step writes a different --primary-500 (Ceramic) or
// --primary (default theme) value.
export function brandColor(): string {
  try {
    const css = fs.readFileSync(
      path.join(process.cwd(), "styles", "globals.css"),
      "utf8",
    );
    const match =
      css.match(/--primary-500:\s*(#[0-9a-fA-F]{6})/) ??
      css.match(/--primary:\s*(#[0-9a-fA-F]{6})/);
    return match?.[1] ?? "#0071e3";
  } catch {
    return "#0071e3";
  }
}
