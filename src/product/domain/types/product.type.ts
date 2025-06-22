export interface ICreateProduct {
    name: string;
    description?: string;
    price: number;
    images?: string[];
    stock: number;
    color?: string;
    essence?: string;
    associatedEmotion?: string;
    brand?: string;
    subCategory?: string;
};
