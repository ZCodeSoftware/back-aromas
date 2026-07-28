export interface ICreateColor {
    name: string,
    hex: string,
}

export interface IUpdateColor {
    name?: string;
    hex?: string;
    isActive?: boolean;
}