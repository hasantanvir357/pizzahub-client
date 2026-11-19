'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthUser, getToken, setAuthSession, type AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    // Only verify once per session_id to avoid duplicate calls on re-renders.
    if (!sessionId || startedRef.current) return;
    startedRef.current = true;

    const token = getToken();
    if (!token) return; // Not signed in — nothing to verify client-side.

    let cancelled = false;
    (async () => {
      setVerifying(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { message?: string }).message || 'Failed to verify your subscription.');
        }

        // Persist plan:'premium' into the stored auth user so it reflects
        // immediately across the dashboard (auth-change event re-syncs all listeners).
        const current = getAuthUser();
        const serverUser = (data as { user?: AuthUser }).user;
        if (serverUser) {
          setAuthSession(token, { ...serverUser, plan: 'premium' });
        } else if (current) {
          setAuthSession(token, { ...current, plan: 'premium' });
        }

        if (!cancelled) {
          toast.success('Your account has been upgraded to Premium!');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Could not verify your subscription.';
          toast.error(message);
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 text-center max-w-md w-full">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-gray-900">Payment Successful</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Your payment was processed successfully. Your Premium plan is now active and your kitchen is ready to
          grow — thank you for choosing PizzaHub!
        </p>

        {verifying && (
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Activating your Premium plan...
          </p>
        )}

        <Button
          render={<Link href="/dashboard" className="inline-flex items-center justify-center" />}
          size="lg"
          className="mt-8 w-full rounded-xl text-sm font-bold bg-[#E20001] hover:bg-[#DB0007] text-white"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4">
          <Loader2 className="w-8 h-8 text-[#E20001] animate-spin" />
        </div>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
