interface Props {
  message: string;
}

export function EmptyState({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
      <span className="mb-2 text-4xl" aria-hidden>
        ∅
      </span>
      <p>{message}</p>
    </div>
  );
}
