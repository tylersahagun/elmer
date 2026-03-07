"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UserPlus,
  Copy,
  Check,
  Link as LinkIcon,
  Mail,
  Shield,
  UserCircle,
  Eye,
} from "lucide-react";
import type { WorkspaceRole } from "@/lib/db/schema";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface InviteModalProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvitationResult {
  id: string;
  token: string;
  email: string;
  role: WorkspaceRole;
  expiresAt: string;
  inviteUrl: string;
}

export function InviteModal({
  workspaceId,
  open,
  onOpenChange,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [copied, setCopied] = useState(false);
  const [inviteResult, setInviteResult] = useState<InvitationResult | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInvitation = useMutation(api.invitations.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteError(null);
    setIsSubmitting(true);
    try {
      const result = await createInvitation({
        workspaceId: workspaceId as Id<"workspaces">,
        email: email.trim(),
        role,
      });
      const baseUrl = window.location.origin || "http://localhost:3000";
      setInviteResult({
        id: result.id,
        token: result.token,
        email: result.email,
        role: result.role as WorkspaceRole,
        expiresAt: new Date(result.expiresAt).toISOString(),
        inviteUrl: `${baseUrl}/invite/${result.token}`,
      });
    } catch (error) {
      setInviteError(
        error instanceof Error ? error.message : "Failed to create invitation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteResult?.inviteUrl) return;
    await navigator.clipboard.writeText(inviteResult.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setInviteResult(null);
    setCopied(false);
    setInviteError(null);
    onOpenChange(false);
  };

  const handleSendAnother = () => {
    setEmail("");
    setRole("member");
    setInviteResult(null);
    setCopied(false);
    setInviteError(null);
  };

  const getRoleIcon = (r: WorkspaceRole) => {
    switch (r) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "member":
        return <UserCircle className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-500" />
            Invite to Workspace
          </DialogTitle>
          <DialogDescription>
            {inviteResult
              ? "Share this link with your teammate"
              : "Enter an email address to invite someone to this workspace"}
          </DialogDescription>
        </DialogHeader>

        {inviteResult ? (
          // Success state - show invite link
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{inviteResult.email}</span>
                <span className="text-muted-foreground">as</span>
                <span className="flex items-center gap-1 font-medium">
                  {getRoleIcon(inviteResult.role)}
                  {inviteResult.role}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                  <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate text-muted-foreground">
                    {inviteResult.inviteUrl}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                This link expires in 7 days
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleSendAnother}>
                Invite Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          // Input state - email and role form
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {inviteError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {inviteError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as WorkspaceRole)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                      <span className="text-muted-foreground">
                        - Full access
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      <span>Member</span>
                      <span className="text-muted-foreground">
                        - Can edit
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>Viewer</span>
                      <span className="text-muted-foreground">
                        - Read only
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
