import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <SignIn
        routing="hash"
        signUpUrl="/signup"
        fallbackRedirectUrl="/workspace"
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
