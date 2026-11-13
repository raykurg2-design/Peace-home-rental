import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InstallPrompt } from "@/components/InstallPrompt";

/** Customer-facing site chrome. Owner tools live under `/owner` with a separate shell. */
export function Shell({
  children,
  overlayHeader = false,
}: {
  children: React.ReactNode;
  overlayHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader overlay={overlayHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <InstallPrompt />
    </div>
  );
}
