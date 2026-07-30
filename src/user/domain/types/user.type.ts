export interface ICreateUser {
    email: string;
    password: string;
};

export interface IUpdateUser {
    firstName?: string;
    lastName?: string;
    phone?: string;
    newsletter?: boolean;
    email?: string;
    /** Admin-only lever, not exposed on the self-service route. */
    isActive?: boolean;
    /** Admin-only, not exposed on the self-service route. Replaces the full role set. */
    roles?: string[];
};
