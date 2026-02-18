"use client";

import { Plus } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StationDialog } from "./StationDialog";
import { User } from "./types";

interface StationManagementHeaderProps {
  isAdmin: boolean;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (open: boolean) => void;
  allUsers: User[];
  userFetchError: string | null;
  onCreate: (data: { name: string; description: string; userIds: string[] }) => Promise<void>;
}

export function StationManagementHeader({
  isAdmin,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
  allUsers,
  userFetchError,
  onCreate,
}: StationManagementHeaderProps) {
  return (
    <div className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] mb-4 rounded-lg border-1 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <ShoppingCart className="h-6 w-6 flex-shrink-0 text-blue-600 sm:h-8 sm:w-8" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-gray-100 sm:text-3xl">
              {isAdmin ? "POS Station Management" : "Select POS Station"}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isAdmin
                ? "Manage your bar stations and assign users"
                : "Choose a station to start selling"}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="w-full flex-shrink-0 sm:w-auto">
            <StationDialog
              mode="create"
              users={allUsers}
              userFetchError={userFetchError}
              isOpen={isCreateDialogOpen}
              onOpenChange={onCreateDialogOpenChange}
              onSubmit={onCreate}
              trigger={
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create Station
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
