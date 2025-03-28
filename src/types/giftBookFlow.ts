
import { ChildProfileFormData } from './childProfile';

export type ThemeType = 'fairy-tale' | 'adventure' | 'travel' | 'school' | 'magic' | 'custom';

export type GiftFlowState = {
  childProfile: ChildProfileFormData;
  theme?: ThemeType;
  customPlace?: string;
  giftMessage?: string;
  delivery?: DeliveryInfo;
};

export type DeliveryInfo = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};
