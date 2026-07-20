"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { EmailIcon, SaveFloppyIcon } from "mage-icons-react/bulk";
import { PlusIcon, ReloadIcon, TrashIcon } from "mage-icons-react/stroke";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import useSWRMutation from "swr/mutation";
import { patch, remove } from "@/lib/apis";
import { toast } from "sonner";
import CreateSMTP from "@/components/campaigns/settings/create-smtp";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>

        <div className="md:col-span-3">
          <EmailSettings />
        </div>
      </div>
    </div>
  );
}

function EmailSettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLimits, setEditingLimits] = useState({});
  const [savingIds, setSavingIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch available email accounts
  const {
    data: emailAccounts,
    isLoading,
    error,
    mutate: refreshEmails,
  } = useSWR("/api/google_apps", fetcher);

  // Setup mutation for updating email daily limit
  const { trigger: updateEmailLimit } = useSWRMutation(
    "/api/google_apps/update",
    patch,
  );

  const handleDailyLimitChange = (id, value) => {
    setEditingLimits((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveDailyLimit = async (email) => {
    const newLimit = Number.parseInt(
      editingLimits[email.id] || email.dailyLimit,
    );

    if (isNaN(newLimit) || newLimit < 1) {
      toast.error("Please enter a valid daily limit");
      return;
    }

    setSavingIds((prev) => [...prev, email.id]);

    try {
      await updateEmailLimit({
        id: email.id,
        dailyLimit: newLimit,
      });
      toast.success("Daily limit updated successfully");
      refreshEmails();
    } catch (error) {
      toast.error("Failed to update daily limit");
      console.error("Error updating daily limit:", error);
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== email.id));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await remove(`/api/google_apps/${deleteTarget.id}`);
      toast.success("Email account removed");
      setDeleteTarget(null);
      refreshEmails();
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to remove email account";
      toast.error(message);
      // Refresh so usage counts reflect reality if a campaign changed.
      refreshEmails();
    } finally {
      setIsDeleting(false);
    }
  };

  const isBlocked = (deleteTarget?.activeCampaignCount || 0) > 0;

  if (isLoading) {
    return (
      <div className="border border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-center items-center h-40">
          <ReloadIcon className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-lg">Loading email accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col justify-center items-center h-40">
          <p className="text-lg text-red-600">Failed to load email accounts</p>
          <Button onClick={() => refreshEmails()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const emails = emailAccounts || [];

  return (
    <div id="email-settings">
      <div className="border border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Connected Email Accounts</h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Setup New Email
          </Button>
        </div>

        {emails.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-none p-6 text-center">
            <EmailIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No email accounts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add an email account to use in your campaigns
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Setup Email
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email.id}
                className="border border-gray-200 p-4 rounded-none bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{email.username}</p>
                    <p className="text-sm text-gray-500">Host: {email.host}</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`daily-limit-${email.id}`}
                        className="text-sm whitespace-nowrap"
                      >
                        Daily Limit:
                      </label>
                      <Input
                        id={`daily-limit-${email.id}`}
                        type="number"
                        min="1"
                        className="w-24"
                        value={
                          editingLimits[email.id] !== undefined
                            ? editingLimits[email.id]
                            : email.dailyLimit || 100
                        }
                        onChange={(e) =>
                          handleDailyLimitChange(email.id, e.target.value)
                        }
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSaveDailyLimit(email)}
                      disabled={savingIds.includes(email.id)}
                    >
                      {savingIds.includes(email.id) ? (
                        <>
                          <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <SaveFloppyIcon className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={`Remove ${email.username}`}
                      onClick={() => setDeleteTarget(email)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup Email Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Setup Email Account</DialogTitle>
          </DialogHeader>
          <CreateSMTP />
        </DialogContent>
      </Dialog>

      {/* Delete Credential Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBlocked ? "Can't remove this account" : "Remove email account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked
                ? `${deleteTarget?.username} is used in ${
                    deleteTarget?.activeCampaignCount
                  } active campaign${
                    deleteTarget?.activeCampaignCount === 1 ? "" : "s"
                  }. Unselect it from those campaigns before you can remove it.`
                : `${deleteTarget?.username} isn't used in any active campaign. This removes it permanently and can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {isBlocked ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {!isBlocked && (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
