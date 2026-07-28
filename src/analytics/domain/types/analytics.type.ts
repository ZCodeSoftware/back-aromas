export interface IProductRef {
    _id: string;
    name?: string;
}

export interface IProductMetrics {
    product: IProductRef;
    seeTimes: number;
    sellTimes: number;
    addCartTimes: number;
}

export interface ITopProduct {
    product: IProductRef;
    value: number;
}

export interface ITopSoldProduct {
    product: IProductRef;
    name: string;
    quantity: number;
    revenue: number;
}

export interface IOrdersByStatus {
    status: string;
    count: number;
}

export interface ISalesSummary {
    totalOrders: number;
    /** Sum of totalPrice over every order that was not cancelled. */
    revenue: number;
    ordersByStatus: IOrdersByStatus[];
    topSold: ITopSoldProduct[];
}

export interface IDashboard {
    catalogue: {
        totalProducts: number;
        totalUsers: number;
    };
    sales: ISalesSummary;
    engagement: {
        topViewed: ITopProduct[];
        topAddedToCart: ITopProduct[];
    };
}
