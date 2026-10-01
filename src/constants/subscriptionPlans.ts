// subscriptionPlans v1.1 (01/10/2026) : identifiants de prix du compte Stripe LIVE.
//   Le meme couple figure dans l'Edge Function create-checkout (ALLOWED_PRICE_IDS) :
//   les deux listes doivent rester identiques, sinon le paiement est refuse.
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: 'price_1ULoETBGbozI77cCEsGVtWNk', // Live, 29,99 EUR/mois
    name: 'Abonnement mensuel',
    price: 29.99,
    currency: '€',
    interval: 'mois',
  },
  yearly: {
    priceId: 'price_1ULoD6BGbozI77cCCClM6gvK', // Live, 299,99 EUR/an
    name: 'Abonnement annuel',
    price: 299.99,
    currency: '€',
    interval: 'an',
  },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;
