'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isAllowedAdminEmail, parseAllowlist } from '@/lib/adminAllowlist';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const allowlist = useMemo(
      () => parseAllowlist(process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST ?? ''),
      [],
    );

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          router.replace('/login');
          setLoading(false);
          return;
        }

        const isAllowed = isAllowedAdminEmail(currentUser.email, allowlist);

        if (!isAllowed) {
          router.replace('/');
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [allowlist, router]);

    if (loading) {
      return (
        <div className="grid min-h-screen place-items-center bg-[var(--bg)] p-6">
          <p className="panel-surface px-5 py-3 text-sm text-[var(--text-2)]">Loading admin session...</p>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
