export interface ICreatePaymentMethod {
    name: string;
};

export interface IUpdatePaymentMethod {
    name?: string;
    isActive?: boolean;
};