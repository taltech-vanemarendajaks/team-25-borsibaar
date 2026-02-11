import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User } from "./types";

interface UserSelectionListProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  error?: string | null;
}

export function UserSelectionList({
  users,
  selectedUserIds,
  onSelectionChange,
  error,
}: UserSelectionListProps) {
  const handleToggle = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  return (
    <div>
      <Label>Assign Users</Label>
      <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-400">No users available</p>
        ) : (
          users.map(user => {
            const isChecked = selectedUserIds.includes(user.id.toString());
            return (
              <div
                key={user.id}
                className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-700/50"
                onClick={() => handleToggle(user.id.toString())}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(user.id.toString())}
                />
                <span className="text-sm text-gray-200">{user.name || user.email}</span>
                {user.role && <span className="text-xs text-gray-400">({user.role})</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
