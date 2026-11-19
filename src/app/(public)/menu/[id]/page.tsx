'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  Clock,
  ShieldAlert,
  CreditCard,
  Star,
  Send,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';
import { getAuthUser, getToken, AuthUser } from '@/lib/auth-session';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  toppings?: string[];
  restaurantName?: string;
}

interface Review {
  _id: string;
  user?: { name?: string; image?: string };
  customerName?: string;
  rating: number;
  comment?: string;
  review?: string;
  createdAt?: string;
  date?: string;
}

function ReviewStars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} ${
            value >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function formatReviewDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const SIZE_MULTIPLIERS: Record<'Regular' | 'Medium' | 'Large', number> = {
  Regular: 1,
  Medium: 1.25,
  Large: 1.5,
};

export default function MenuDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<'Regular' | 'Medium' | 'Large'>('Regular');
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/34');
  const [cardCvc, setCardCvc] = useState('123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [user] = useState<AuthUser | null>(() => getAuthUser());
  useEffect(() => {
    let ignore = false;
    const fetchItem = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setItem(data.item || data);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (id) fetchItem();
    return () => {
      ignore = true;
    };
  }, [id]);

  // Fetch customer reviews for this menu item.
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${id}/reviews`);
        if (!res.ok) {
          if (!ignore) setReviewsError('Unable to load reviews.');
          return;
        }
        const data = await res.json();
        if (ignore) return;
        const list = data.reviews || data.data || data;
        setReviews(Array.isArray(list) ? list : []);
      } catch {
        if (!ignore) setReviewsError('Unable to load reviews.');
      } finally {
        if (!ignore) setReviewsLoading(false);
      }
    };
    fetchReviews();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">Loading pizza details...</div>;
  }

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Menu item not found.</p>
        <Link href="/menu" className="text-[#E20001] font-semibold hover:underline">
          Back to Menu
        </Link>
      </div>
    );
  }

  const isStaff = user?.role === 'vendor' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length : 0;
  const unitPrice = Number((item.price * SIZE_MULTIPLIERS[size]).toFixed(2));
  const totalAmount = Number((unitPrice * quantity).toFixed(2));

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaff) return;

    const token = getToken();
    if (!token || !user) {
      router.push('/sign-in');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuItemId: item._id,
          size,
          quantity,
          totalPrice: totalAmount,
          phone,
          customerPhone: phone,
          address,
          deliveryAddress: address,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.message || 'Failed to place order';
        setError(message);
        toast.error(message);
      } else {
        toast.success('Order placed successfully!');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/dashboard/my-orders');
      }
    } catch {
      const message = 'Network error while placing order.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();

    // Only signed-in customers may submit a review.
    if (!user || user.role !== 'customer') {
      toast.error('Please sign in as a customer to leave a review.');
      if (!user) router.push('/sign-in');
      return;
    }
    if (!token) {
      router.push('/sign-in');
      return;
    }
    if (rating < 1) {
      toast.error('Please select a star rating (1–5).');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu/${item._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: reviewText.trim(),
          review: reviewText.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      const created = data.review || data.data;
      setReviews((prev) => [
        ...(created
          ? [created]
          : [
              {
                _id: `${Date.now()}`,
                user: { name: user.name, image: user.image },
                rating,
                comment: reviewText.trim(),
                createdAt: new Date().toISOString(),
              },
            ]),
        ...prev,
      ]);
      setRating(0);
      setReviewText('');
      toast.success('Review submitted! Thank you for your feedback.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review.';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#E20001] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image & Ingredients */}
        <div>
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100 mb-5">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
              {item.category}
            </span>
          </div>

          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E20001] mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>{item.restaurantName || 'PizzaHub Kitchen'}</span>
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{item.name}</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">{item.description}</p>

          {item.toppings && item.toppings.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {item.toppings.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-xs font-medium text-gray-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#E20001]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Role-Based Panel */}
        <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
          {isStaff ? (
            /* Vendor & Admin View: ONLY Size & Pricing Breakdown (No Checkout Inputs) */
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Menu Pricing Overview</p>
                  <p className="text-3xl font-extrabold text-[#E20001]">
                    ${Number((item.price * SIZE_MULTIPLIERS[size]).toFixed(2))}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-[#E20001] text-xs font-bold uppercase">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {user?.role} View
                </span>
              </div>

              <p className="text-xs font-bold text-gray-700 mb-3">Price by Pizza Size</p>
              <div className="space-y-3 mb-6">
                {(['Regular', 'Medium', 'Large'] as const).map((sz) => {
                  const szPrice = Number((item.price * SIZE_MULTIPLIERS[sz]).toFixed(2));
                  const selected = size === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-[#E20001] text-white border-[#E20001] shadow-sm'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-[#E20001]/40'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm">{sz} Size</p>
                        <p className={`text-xs ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                          {sz === 'Regular'
                            ? '10" Standard Crust'
                            : sz === 'Medium'
                              ? '12" Classic Hand-Tossed'
                              : '14" Family Feast'}
                        </p>
                      </div>
                      <span className="text-lg font-extrabold">${szPrice}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 leading-relaxed">
                Signed in as <strong className="uppercase text-gray-900">{user?.role}</strong>. Checkout fields are
                hidden for staff accounts; only size-wise menu pricing is displayed here.
              </div>
            </div>
          ) : (
            /* Customer View: Full Interactive Order Form */
            <form onSubmit={handleOrder} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Amount</p>
                  <p className="text-3xl font-extrabold text-[#E20001]">${totalAmount}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  30-Min Express Delivery
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Select Size</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Regular', 'Medium', 'Large'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        size === sz
                          ? 'bg-[#E20001] text-white border-[#E20001]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#E20001]'
                      }`}
                    >
                      {sz} (${Number((item.price * SIZE_MULTIPLIERS[sz]).toFixed(2))})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+880 17XX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Area, City..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Card / Stripe Payment">Card / Stripe Payment</option>
                </select>
              </div>

              <AnimatePresence initial={false}>
                {paymentMethod === 'Card / Stripe Payment' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 rounded-2xl border border-[#E20001]/25 bg-linear-to-br from-[#FFF6F5] to-white p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-[#E20001]">
                          <CreditCard className="w-4 h-4" />
                          Test Card Details
                        </p>
                        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Stripe Test Mode
                        </span>
                      </div>
                      <div>
                        <label htmlFor="card-number" className="block text-[11px] font-bold text-gray-600 mb-1">
                          Card Number
                        </label>
                        <input
                          id="card-number"
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-[#E20001]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="card-expiry" className="block text-[11px] font-bold text-gray-600 mb-1">
                            Expiry
                          </label>
                          <input
                            id="card-expiry"
                            type="text"
                            inputMode="numeric"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="card-cvc" className="block text-[11px] font-bold text-gray-600 mb-1">
                            CVC
                          </label>
                          <input
                            id="card-cvc"
                            type="text"
                            inputMode="numeric"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001]"
                            required
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Demo values are pre-filled. No real payment is processed.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <p className="text-xs font-semibold text-[#E20001]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white font-bold text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? 'Placing Order...' : `Confirm Order ($${totalAmount})`}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Customer Reviews */}
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-9 h-9 rounded-lg bg-red-50 text-[#E20001] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-extrabold text-gray-900">Customer Reviews</h2>
          <span className="text-sm text-gray-500">({reviews.length})</span>
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center sm:text-left shrink-0">
              <p className="text-4xl font-extrabold text-gray-900">{averageRating.toFixed(1)}</p>
              <div className="flex items-center justify-center sm:justify-start mt-1.5">
                <ReviewStars value={Math.round(averageRating)} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{reviews.length} review(s)</p>
            </div>
            <div className="hidden sm:block h-px bg-gray-100 flex-1" />
            <div className="flex-1 text-sm text-gray-600 leading-relaxed">
              {isCustomer
                ? 'Taste the pizza? Share your experience with the PizzaHub community.'
                : 'Sign in as a customer to rate and review this pizza.'}
            </div>
          </div>
        </div>

        {/* Review Form (logged-in customers only) */}
        {isCustomer && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 mb-6 space-y-4">
            <p className="text-sm font-bold text-gray-900">Rate this pizza</p>

            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className="p-0.5 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-gray-500">
                {rating ? `${rating}/5` : 'Select rating'}
              </span>
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us what you thought of this pizza..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#E20001] resize-none"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E20001] hover:bg-[#DB0007] text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {submittingReview ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewerName = review.user?.name || review.customerName || 'Anonymous Customer';
              return (
                <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#E20001] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{reviewerName}</p>
                      <p className="text-[11px] text-gray-400">{formatReviewDate(review.createdAt || review.date)}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <ReviewStars value={Number(review.rating) || 0} />
                  </div>
                  {(review.comment || review.review) && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment || review.review}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <UserIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reviews yet. Be the first to review this pizza!</p>
          </div>
        )}

        {reviewsError && (
          <p className="mt-4 text-center text-xs font-semibold text-gray-400">{reviewsError}</p>
        )}
      </section>
    </div>
  );
}
