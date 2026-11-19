'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { getToken } from '@/lib/auth-session';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  label: string;
  included: boolean;
}

const freeFeatures: PlanFeature[] = [
  { label: 'Up to 3 active menu items', included: true },
  { label: 'Standard menu listing', included: true },
  { label: 'Basic order tracking', included: true },
  { label: 'Unlimited menu items', included: false },
  { label: 'Premium badge on your menu', included: false },
  { label: 'Featured placement on homepage', included: false },
];

const premiumFeatures: PlanFeature[] = [
  { label: 'Unlimited menu items', included: true },
  { label: 'Premium badge on your menu', included: true },
  { label: 'Featured placement on homepage', included: true },
  { label: 'Advanced sales analytics', included: true },
  { label: 'Priority customer support', included: true },
  { label: 'Commission-free transactions', included: true },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Please sign in to upgrade your plan.');
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to start checkout.');
      }
      const sessionUrl = data.session?.url || data.url;
      if (!sessionUrl) {
        throw new Error('Checkout session URL not returned.');
      }
      // Redirect to Stripe checkout hosted page.
      window.location.href = sessionUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while upgrading.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose the plan that fits your pizzeria. Upgrade anytime to grow your kitchen.
        </p>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Free</h2>
              <p className="text-xs text-gray-500 mt-0.5">For getting started</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
              Starter
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900">$0</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>

          <ul className="mt-6 space-y-3 flex-1">
            {freeFeatures.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    feature.included ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </span>
                <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            size="lg"
            disabled
            className="mt-8 w-full rounded-xl text-sm font-bold bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed"
          >
            Current Plan
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="relative bg-white rounded-2xl border-2 border-[#E20001] shadow-xl shadow-red-100 p-6 md:p-8 flex flex-col">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E20001] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Recommended
          </span>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 inline-flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#E20001]" />
                Premium
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">For growing kitchens</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-50 text-[#E20001] text-xs font-bold uppercase tracking-wider">
              Pro
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-[#E20001]">$19.99</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>

          <ul className="mt-6 space-y-3 flex-1">
            {premiumFeatures.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-red-50 text-[#E20001] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-gray-700">{feature.label}</span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            size="lg"
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-8 w-full rounded-xl text-sm font-bold bg-[#E20001] hover:bg-[#DB0007] text-white pizza-glow disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Checkout...
              </>
            ) : (
              'Upgrade to Premium'
            )}
          </Button>
        </div>
      </div>

      {/* Comparison Note */}
      <p className="mt-6 text-center text-xs text-gray-400">
        Cancel or downgrade anytime. Premium unlocks unlimited menu items, a premium badge, and featured placement.
      </p>
    </div>
  );
}
