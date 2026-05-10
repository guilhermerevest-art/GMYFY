import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-green-700">Gymfy</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Plataforma de gamificação que transforma a frequência na academia em uma experiência competitiva e recompensadora.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
          >
            Cadastrar Academia
          </Link>
        </div>
      </div>
    </div>
  );
}
