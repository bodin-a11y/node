export type Role = 'seller' | 'installer' | 'admin';

export interface UserIdentity {
  id: string;                // наш внутренний id (можно = planfixContactId)
  planfixContactId?: string; // появится после интеграции с Planfix
  roles: Role[];
  displayName: string;
}

export interface JwtPayload {
  sub: string;               // id
  roles: Role[];
  pfcid?: string;            // planfixContactId
}
