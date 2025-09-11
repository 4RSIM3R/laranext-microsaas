import { Feature } from "./feature";

export type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    price: number;
    signup_fee: number;
    trial_period: number;
    trial_interval: string;
    invoice_period: number;
    invoice_interval: string;
    grace_period: number;
    grace_interval: string;
    prorate_day: number | null;
    prorate_period: number | null;
    prorate_extend_due: number | null;
    active_subscribers_limit: number | null;
    sort_order: number;
    stripe_price_id: string | null;
    stripe_product_id: string | null;
    currency: string;
    created_at?: string;
    updated_at?: string;
    features?: Feature[];
};
