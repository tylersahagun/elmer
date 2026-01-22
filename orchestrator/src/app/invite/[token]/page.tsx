"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Mail,
  Shield,
  UserCircle,
  Eye,
  Clock,
  XCircle,
  CheckCircle,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { WorkspaceRole } from "@/lib/db/schema";

interface InvitationDetails {
  id: string;
  email: string;
  role: WorkspaceRole;
  workspace: {
    id: string;
    name: string;
  };
  inviter: {
    name: string | null;
    email: string;
  };
  expiresAt: string;
  isExpired: boolean;
  isAccepted: boolean;
  isValid: boolean;
}

export default function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Fetch invitation details
  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery<InvitationDetails>({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const res = await fetch(`/api/invitations/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch invitation");
      }
      return res.json();
    },
    retry: false,
  });

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/invitations/${token}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept invitation");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAcceptSuccess(true);
      // Redirect to workspace after a short delay
      setTimeout(() => {
        router.push(`/workspace/${data.workspaceId}`);
      }, 2000);
    },
  });

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5" />;
      case "member":
        return <UserCircle className="w-5 h-5" />;
      case "viewer":
        return <Eye className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (role: WorkspaceRole) => {
    switch (role) {
      case "admin":
        return "Full access to manage workspace settings and members";
      case "member":
        return "Can create and edit projects and content";
      case "viewer":
        return "Can view projects and content (read-only)";
    }
  };

  // Loading state
  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (invitation not found)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (invitation?.isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation to join <strong>{invitation.workspace.name}</strong> has
              expired. Please contact the workspace admin to request a new
              invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already accepted invitation
  if (invitation?.isAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle>Invitation Already Used</CardTitle>
            <CardDescription>
              This invitation to join <strong>{invitation.workspace.name}</strong> has
              already been accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href={`/workspace/${invitation.workspace.id}`}>
                Go to Workspace
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state after accepting
  if (acceptSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle>Welcome to {invitation?.workspace.name}!</CardTitle>
            <CardDescription>
              You&apos;ve successfully joined the workspace. Redirecting you now...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show details
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-purple-500" />
          </div>
          <CardTitle>You&apos;re Invited!</CardTitle>
          <CardDescription>
            {invitation?.inviter.name || invitation?.inviter.email} has invited
            you to join a workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workspace info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold">{invitation?.workspace.name}</p>
                <p className="text-sm text-muted-foreground">Workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {invitation && getRoleIcon(invitation.role)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">{invitation?.role}</p>
                  <Badge variant="secondary" className="text-xs">
                    Your role
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {invitation && getRoleDescription(invitation.role)}
                </p>
              </div>
            </div>
          </div>

          {/* Auth state */}
          {!session ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Sign in or create an account to accept this invitation
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/login?callbackUrl=/invite/${token}`}>
                    Sign In
                  </Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href={`/signup?callbackUrl=/invite/${token}`}>
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Signed in as <strong>{session.user?.email}</strong>
              </p>
              {acceptMutation.error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {acceptMutation.error.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
        {session && (
          <CardFooter>
            <Button
              className="w-full gap-2"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
