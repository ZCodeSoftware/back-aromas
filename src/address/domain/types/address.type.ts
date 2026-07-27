export interface ICreateAddress {
    name?: string;
    street: string;
    number?: number;
    zipCode: string;
    description?: string;
    floorAddress?: string;
    isActive?: boolean;
    typeOfHousing?: string;
    geo?: IGeo;
};

export interface IGeo {
    lat: string;
    lng: string;
}