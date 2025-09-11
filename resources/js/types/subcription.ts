export type Subscription = {
    id: number;
    user_id: number;
    type: string;
    stripe_id: string;
    stripe_status: string;
    stripe_price?: string | null;
    quantity?: number | null;
    trial_ends_at?: string | null;
    ends_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items?: SubscriptionItem[];
};

export type SubscriptionItem = {
    id: number;
    subscription_id: number;
    stripe_id: string;
    stripe_product?: string | null;
    stripe_price: string;
    quantity?: number | null;
    created_at: string;
    updated_at: string;
};
