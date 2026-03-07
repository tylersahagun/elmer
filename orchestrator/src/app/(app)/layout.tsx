import { AppShellProviders } from "@/components/providers/AppShellProviders";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellProviders>{children}</AppShellProviders>;
}
