

export interface ICreateCategory {
    name: string;
    subCategories?: string[];
}

export interface IUpdateCategory {
    name?: string;
    subCategories?: string[];
    isActive?: boolean;
}