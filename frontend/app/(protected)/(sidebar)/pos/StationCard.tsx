"use client";

import { useRouter } from "next/navigation";
import { Edit, Trash2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StationDialog } from "./StationDialog";
import { BarStation, User } from "./types";

interface StationCardProps {
  station: BarStation;
  isAdmin: boolean;
  allUsers: User[];
  userFetchError: string | null;
  editingStationId: number | null;
  onEditClick: (station: BarStation) => void;
  onEditClose: () => void;
  onUpdate: (data: { name: string; description: string; userIds: string[] }) => Promise<void>;
  onDelete: (stationId: number) => void;
}

export function StationCard({
  station,
  isAdmin,
  allUsers,
  userFetchError,
  editingStationId,
  onEditClick,
  onEditClose,
  onUpdate,
  onDelete,
}: StationCardProps) {
  const router = useRouter();

  return (
    <div className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] w-full max-w-full overflow-hidden rounded-lg border border-1 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-xl font-bold text-gray-100">{station.name}</h3>
          {station.description && (
            <p className="line-clamp-2 text-sm break-words text-gray-400">{station.description}</p>
          )}
        </div>
        <Store className="h-5 w-5 flex-shrink-0 text-blue-400" />
      </div>

      {station.assignedUsers && station.assignedUsers.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs text-gray-400">Assigned Users:</p>
          <div className="flex flex-wrap gap-1">
            {station.assignedUsers.slice(0, 3).map((user: User) => (
              <span
                key={user.id}
                className="max-w-full truncate rounded bg-gray-700 px-2 py-1 text-xs text-gray-300"
              >
                {user.name || user.email}
              </span>
            ))}
            {station.assignedUsers.length > 3 && (
              <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
                +{station.assignedUsers.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => router.push(`/pos/${station.id}`)}
          className="w-full min-w-0 flex-1 bg-green-600 hover:bg-green-700 sm:w-auto"
        >
          <span className="truncate">Open Station</span>
        </Button>

        {isAdmin && (
          <div className="flex flex-shrink-0 gap-2">
            <StationDialog
              mode="edit"
              station={station}
              users={allUsers}
              userFetchError={userFetchError}
              isOpen={editingStationId === station.id}
              onOpenChange={open => {
                if (!open) {
                  onEditClose();
                } else {
                  onEditClick(station);
                }
              }}
              onSubmit={onUpdate}
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditClick(station)}
                  className="flex-shrink-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />

            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(station.id)}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
