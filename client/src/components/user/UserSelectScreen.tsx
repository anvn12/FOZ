import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useSession } from "../../hooks/useSession";
import { UserAvatar } from "./UserAvatar";
import { LoadingSpinner } from "../common/LoadingSpinner";
import type { User } from "../../types";

export function UserSelectScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectUser } = useSession();

  useEffect(() => {
    api
      .get<User[]>("/api/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-2xl font-bold">FOZ</h1>
      <p className="mb-8 text-neutral-400">Choose who you are — no password needed.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => selectUser(user.id)}
            className="flex min-h-[72px] items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-left transition hover:border-neutral-600"
          >
            <UserAvatar user={user} size="lg" />
            <span className="font-medium">{user.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
