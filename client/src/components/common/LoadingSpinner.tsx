interface Props {
  fullPage?: boolean;
}

export function LoadingSpinner({ fullPage }: Props) {
  const spinner = (
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-white"
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-4">{spinner}</div>;
}
