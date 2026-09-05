export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div id="toast">
      <div className="t" role="status">{message}</div>
    </div>
  );
}
