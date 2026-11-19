import Link from 'next/link';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
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
