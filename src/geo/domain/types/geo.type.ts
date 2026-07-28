export interface ICreateGeo {
    lat: string;
    lng: string;
};

export interface IUpdateGeo {
    lat?: string;
    lng?: string;
    isActive?: boolean;
};
