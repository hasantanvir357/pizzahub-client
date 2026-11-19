import Link from 'next/link';
import { XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 text-center max-w-md w-full">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-[#E20001]" />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-gray-900">Payment Cancelled</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Your payment was cancelled and no charges were made. You can retry the upgrade whenever you are
          ready — your current plan remains active.
        </p>

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
