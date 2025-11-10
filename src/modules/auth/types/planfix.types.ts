export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type DealerInfo = {
  id: string;
  name: string;
  code: string;
};

export type SellerLookupInfo = {
  id: string;
  name: string;
  code: string;
  dealerId?: string;
};

export type SellerTicketInfo = {
  ticketId: string;
  taskId: string;
  status: RegistrationStatus;
};

export type InstallerTicketInfo = {
  ticketId: string;
  taskId: string;
  status: RegistrationStatus;
};

export type SellerRegistrationTaskPayload = {
  ticketId: string;
  eventId: string;

  dealerId: string;
  dealerCode: string;

  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
};

export type InstallerRegistrationTaskPayload = {
  ticketId: string;
  eventId: string;

  sellerId: string;
  sellerCode: string;
  dealerId?: string;

  installerName: string;
  installerEmail: string;
  installerPhone?: string;
};
