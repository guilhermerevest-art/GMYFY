export default function TVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {children}
    </div>
  );
}
