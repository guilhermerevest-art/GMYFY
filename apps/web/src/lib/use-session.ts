'use client';

import { useEffect, useState } from 'react';

interface Session {
  sub: string;
  academiaId: string;
  tipo: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.ok ? r.json() : null)
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading };
}
