export function ScriptLoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function ScriptNotFound() {
  return (
    <div className="flex h-full items-center justify-center text-destructive">
      Script not found
    </div>
  );
}
