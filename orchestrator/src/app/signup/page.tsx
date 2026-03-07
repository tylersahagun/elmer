import { SignUp } from "@clerk/nextjs";

interface SignupPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeRedirectTarget(
  value: string | string[] | undefined,
  fallback: string,
) {
  const redirectTarget = Array.isArray(value) ? value[0] : value;
  return redirectTarget?.startsWith("/") ? redirectTarget : fallback;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const redirectTarget = normalizeRedirectTarget(params?.callbackUrl, "/");
  const signInUrl =
    redirectTarget === "/"
      ? "/login"
      : `/login?callbackUrl=${encodeURIComponent(redirectTarget)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted/30 p-4">
      <SignUp
        routing="hash"
        signInUrl={signInUrl}
        fallbackRedirectUrl={redirectTarget}
        forceRedirectUrl={redirectTarget}
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "rounded-2xl border border-border bg-card shadow-sm",
            headerTitle: "font-heading text-2xl",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border border-border bg-background hover:bg-muted rounded-xl",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
            formFieldInput:
              "border border-border bg-background rounded-xl focus:ring-ring",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}
