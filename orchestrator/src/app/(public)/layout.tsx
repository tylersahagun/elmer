import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
