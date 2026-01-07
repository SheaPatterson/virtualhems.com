import { loadStripe } from '@stripe/stripe-js';

// IMPORTANT: Replace this with your actual Stripe Publishable Key (pk_live_...)
const STRIPE_PUBLISHABLE_KEY = "pk_live_51ScH9nCmY2JSkQjQALAACzfi54t5LIwDU1BJWmLIz8GdGQTGJlWjWN6RpmK6Ksq7jkQbvx7yyXZVgK9zOYbhoxG200OtilEUBX"; 

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);