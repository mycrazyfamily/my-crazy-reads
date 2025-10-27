export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: 'price_1SLPZIBm2xG2OMOvLXjO6KqM',
    name: 'Abonnement mensuel',
    price: 19.99,
    currency: '€',
    interval: 'mois',
  },
  yearly: {
    priceId: 'price_1SLPaABm2xG2OMOvaDzDSB2s',
    name: 'Abonnement annuel',
    price: 219.99,
    currency: '€',
    interval: 'an',
  },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;
