"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserSelectionList } from "./UserSelectionList";
import { BarStation, User } from "./types";

interface StationDialogProps {
  mode: "create" | "edit";
  station?: BarStation;
  users: User[];
  userFetchError: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; userIds: string[] }) => Promise<void>;
  trigger?: React.ReactNode;
}

export function StationDialog({
  mode,
  station,
  users,
  userFetchError,
  isOpen,
  onOpenChange,
  onSubmit,
  trigger,
}: StationDialogProps) {
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUserIds, setFormUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && station) {
      setFormName(station.name);
      setFormDescription(station.description || "");
      setFormUserIds(station.assignedUsers?.map((u: User) => u.id.toString()) || []);
    } else {
      setFormName("");
      setFormDescription("");
      setFormUserIds([]);
    }
  }, [mode, station, isOpen]);

  const handleSubmit = async () => {
    if (!formName.trim()) {
      alert("Station name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formName,
        description: formDescription,
        userIds: formUserIds,
      });
      onOpenChange(false);
      setFormName("");
      setFormDescription("");
      setFormUserIds([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormName("");
    setFormDescription("");
    setFormUserIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Station" : "Edit Station"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new POS station for your organization"
              : "Update station details"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Station Name *</Label>
            <Input
              id="name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g., Main Bar"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <UserSelectionList
            users={users}
            selectedUserIds={formUserIds}
            onSelectionChange={setFormUserIds}
            error={userFetchError}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save"}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
