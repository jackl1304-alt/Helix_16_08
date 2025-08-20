// Simple test component to check if React loads
export default function TestSimple() {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold text-green-600">✓ React App lädt erfolgreich!</h1>
      <p className="mt-4 text-gray-600">Das Problem lag an den Import-Fehlern.</p>
    </div>
  );
}