export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: 'price_1SLPZIBm2xG2OMOvLXjO6KqM',
    name: 'Abonnement mensuel',
    price: 25.99,
    currency: '€',
    interval: 'mois',
  },
  yearly: {
    priceId: 'price_1SLPaABm2xG2OMOvaDzDSB2s',
    name: 'Abonnement annuel',
    price: 285.99,
    currency: '€',
    interval: 'an',
  },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;
