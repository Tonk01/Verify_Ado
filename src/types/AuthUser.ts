export type clientPrincipal = {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
};

export type AuthResponse = {
    clientPrincipal: clientPrincipal | null;
};