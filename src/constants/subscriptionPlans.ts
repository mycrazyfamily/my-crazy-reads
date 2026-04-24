export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: 'price_1SLPZIBm2xG2OMOvLXjO6KqM',
    name: 'Abonnement mensuel',
    price: 29.99,
    currency: '€',
    interval: 'mois',
  },
  yearly: {
    priceId: 'price_1TPk8lBm2xG2OMOvTmJ1KQzT',
    name: 'Abonnement annuel',
    price: 299.99,
    currency: '€',
    interval: 'an',
  },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;
