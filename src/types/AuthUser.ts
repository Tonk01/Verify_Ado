export type ClientPrinciple = {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
};

export type AuthResponse = {
    clientPrinciple: ClientPrinciple | null;
};