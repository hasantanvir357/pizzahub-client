export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
      <span className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#E20001]">
        PizzaHub
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Payment Successful</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        Your payment was processed successfully. Thank you for your order!
      </p>
    </div>
  );
}
