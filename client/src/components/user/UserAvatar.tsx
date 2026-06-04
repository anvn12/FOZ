import { useState } from "react";
import type { User } from "../../types";

interface Props {
  user: User;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function UserAvatar({ user, size = "md" }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (failed) {
    return (
      <div
        className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-neutral-700 font-medium`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      className={`${sizes[size]} shrink-0 rounded-full object-cover`}
      onError={() => setFailed(true)}
    />
  );
}
