export default function Unauthorized() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p>You don't have permission to view this page.</p>
    </div>
  );
}
