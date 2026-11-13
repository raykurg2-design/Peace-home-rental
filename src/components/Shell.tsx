import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InstallPrompt } from "@/components/InstallPrompt";

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
