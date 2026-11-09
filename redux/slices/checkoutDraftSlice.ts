import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type SubstitutionPreference = 'allow_similar' | 'specific' | 'remove';

export type DraftAddress = {
  id: number | null;
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instructions: string;
};

export type DraftSlot = { date: string; start: string; end: string; label?: string };

type CheckoutDraftState = {
  address: DraftAddress | null;
  couponCode: string;
  /** Per-store delivery slot; missing/null means "as soon as possible". */
  slots: Record<string, DraftSlot | null>;
  substitutionDefault: SubstitutionPreference;
  itemSubstitutions: Record<string, { preference: SubstitutionPreference; substituteProductId?: number | null }>;
};

const initialState: CheckoutDraftState = {
  address: null,
  couponCode: '',
  slots: {},
  substitutionDefault: 'allow_similar',
  itemSubstitutions: {},
};

const checkoutDraftSlice = createSlice({
  name: 'checkoutDraft',
  initialState,
  reducers: {
    setDraftAddress: (state, action: PayloadAction<DraftAddress | null>) => {
      state.address = action.payload;
    },
    setDraftCoupon: (state, action: PayloadAction<string>) => {
      state.couponCode = action.payload.trim();
    },
    setDraftSlot: (state, action: PayloadAction<{ storeId: number; slot: DraftSlot | null }>) => {
      state.slots[String(action.payload.storeId)] = action.payload.slot;
    },
    setSubstitutionDefault: (state, action: PayloadAction<SubstitutionPreference>) => {
      state.substitutionDefault = action.payload;
    },
    setItemSubstitution: (
      state,
      action: PayloadAction<{ productId: number; preference: SubstitutionPreference; substituteProductId?: number | null }>,
    ) => {
      state.itemSubstitutions[String(action.payload.productId)] = {
        preference: action.payload.preference,
        substituteProductId: action.payload.substituteProductId ?? null,
      };
    },
    resetCheckoutDraft: (state) => {
      state.couponCode = '';
      state.slots = {};
      state.itemSubstitutions = {};
    },
  },
});

export const {
  setDraftAddress,
  setDraftCoupon,
  setDraftSlot,
  setSubstitutionDefault,
  setItemSubstitution,
  resetCheckoutDraft,
} = checkoutDraftSlice.actions;

export const selectCheckoutDraft = (state: RootState) => state.checkoutDraft;

export default checkoutDraftSlice.reducer;
