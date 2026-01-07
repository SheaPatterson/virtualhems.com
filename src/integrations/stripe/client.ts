import { loadStripe, Stripe } from '@stripe/stripe-js';

// IMPORTANT: This is a live key. In a dev environment, you should use pk_test_...
const STRIPE_PUBLISHABLE_KEY = "pk_live_51ScH9nCmY2JSkQjQALAACzfi54t5LIwDU1BJWmLIz8GdGQTGJlWjWN6RpmK6Ksq7jkQbvx7yyXZVgK9zOYbhoxG200OtilEUBX"; 

let stripePromise: Promise<Stripe | null>;

/**
 * Lazy-loads the Stripe.js script only when needed.
 * This prevents 'Failed to load Stripe.js' errors from blocking the app's initial load.
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};