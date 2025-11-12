export type WarrantyPublicStatus = 'active' | 'expired';
export interface ActivateResult {
  status: 'created' | 'found';
  warranty: { id: string; qr: string; status: WarrantyPublicStatus; createdAt: string };
}
