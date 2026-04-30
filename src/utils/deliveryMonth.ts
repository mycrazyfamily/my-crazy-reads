export const getFirstDeliveryMonth = (): string => {
  const today = new Date();
  const deliveryDate = new Date(today);
  if (today.getDate() > 20) {
    deliveryDate.setMonth(today.getMonth() + 2);
  } else {
    deliveryDate.setMonth(today.getMonth() + 1);
  }
  return deliveryDate.toLocaleDateString('fr-FR', { month: 'long' });
};