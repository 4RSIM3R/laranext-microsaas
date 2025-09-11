import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AdminLayout from '@/layouts/admin-layout';
import planRoutes from '@/routes/admin/plan';
import { Plan } from '@/types/plan';
import { useForm } from '@inertiajs/react';
import { CircleQuestionMarkIcon, Loader2, Plus, Trash2 } from 'lucide-react';

type Props = {
    plan?: Plan;
};

type FormData = {
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    price: string | number;
    signup_fee: string | number;
    trial_period: string | number;
    trial_interval: string;
    invoice_period: string | number;
    invoice_interval: string;
    grace_period: string | number;
    grace_interval: string;
    prorate_day: string | number | null;
    prorate_period: string | number | null;
    prorate_extend_due: string | number | null;
    active_subscribers_limit: string | number | null;
    sort_order: string | number;
    currency: string;
    features: {
        name: string;
        slug: string;
        description: string;
        value: string;
        resettable_period: string | number;
        resettable_interval: string;
        sort_order: string | number;
    }[];
};

const intervalOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
];

const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'IDR', label: 'IDR' },
];

export default function PlanForm({ plan }: Props) {
    const { data, setData, post, put, errors, processing } = useForm<FormData>({
        name: plan?.name || '',
        slug: plan?.slug || '',
        description: plan?.description || '',
        is_active: plan?.is_active || false,
        price: plan?.price || 0,
        signup_fee: plan?.signup_fee || 0,
        trial_period: plan?.trial_period || 0,
        trial_interval: plan?.trial_interval || 'day',
        invoice_period: plan?.invoice_period || 1,
        invoice_interval: plan?.invoice_interval || 'month',
        grace_period: plan?.grace_period || 0,
        grace_interval: plan?.grace_interval || 'day',
        prorate_day: plan?.prorate_day || null,
        prorate_period: plan?.prorate_period || null,
        prorate_extend_due: plan?.prorate_extend_due || null,
        active_subscribers_limit: plan?.active_subscribers_limit || null,
        sort_order: plan?.sort_order || 0,
        currency: plan?.currency || 'USD',
        features:
            plan?.features?.map((f) => ({
                name: f.name,
                slug: f.slug,
                description: f.description,
                value: f.value,
                resettable_period: f.resettable_period,
                resettable_interval: f.resettable_interval,
                sort_order: f.sort_order,
            })) || [],
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (plan) {
            put(planRoutes.update.url(plan.id));
        } else {
            post(planRoutes.store.url());
        }
    };

    const addFeature = () => {
        setData('features', [
            ...data.features,
            {
                name: '',
                slug: '',
                description: '',
                value: '',
                resettable_period: 0,
                resettable_interval: 'month',
                sort_order: data.features.length,
            },
        ]);
    };

    const removeFeature = (index: number) => {
        const newFeatures = data.features.filter((_, i) => i !== index);
        setData('features', newFeatures);
    };

    const updateFeature = (index: number, field: string, value: any) => {
        const newFeatures = [...data.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setData('features', newFeatures);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">{plan ? 'Edit Plan' : 'Create Plan'}</h1>
                    <p className="text-sm text-gray-500">{plan ? 'Update plan details and features' : 'Create a new subscription plan'}</p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <CircleQuestionMarkIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to see step-by-step guidance</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
                        <CardDescription>Configure the basic plan details.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">Plan Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    if (!plan) setData('slug', generateSlug(e.target.value));
                                }}
                                placeholder="Premium Plan"
                            />
                            <InputError message={errors?.name} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="premium-plan" />
                            <InputError message={errors?.slug} />
                        </div>
                        <div className="col-span-full flex flex-col gap-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Plan description..."
                                rows={3}
                            />
                            <InputError message={errors?.description} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="text"
                                inputMode="numeric"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors?.sort_order} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Pricing</CardTitle>
                        <CardDescription>Set up pricing and billing configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="price">Price *</Label>
                            <Input
                                id="price"
                                type="text"
                                inputMode="decimal"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                placeholder="99.90"
                            />
                            <InputError message={errors?.price} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="currency">Currency *</Label>
                            <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.currency} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="signup_fee">Signup Fee</Label>
                            <Input
                                id="signup_fee"
                                type="text"
                                inputMode="decimal"
                                value={data.signup_fee}
                                onChange={(e) => setData('signup_fee', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors?.signup_fee} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="active_subscribers_limit">Subscriber Limit</Label>
                            <Input
                                id="active_subscribers_limit"
                                type="number"
                                inputMode="numeric"
                                value={data.active_subscribers_limit || ''}
                                onChange={(e) => setData('active_subscribers_limit', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Unlimited"
                            />
                            <InputError message={errors?.active_subscribers_limit} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Billing Cycle</CardTitle>
                        <CardDescription>Configure billing and invoice settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="invoice_period">Invoice Period *</Label>
                            <Input
                                id="invoice_period"
                                type="text"
                                inputMode="numeric"
                                value={data.invoice_period}
                                onChange={(e) => setData('invoice_period', parseInt(e.target.value) || 1)}
                            />
                            <InputError message={errors?.invoice_period} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="invoice_interval">Invoice Interval *</Label>
                            <Select value={data.invoice_interval} onValueChange={(value) => setData('invoice_interval', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    {intervalOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.invoice_interval} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Trial & Grace Period</CardTitle>
                        <CardDescription>Configure trial and grace period settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="trial_period">Trial Period</Label>
                            <Input
                                id="trial_period"
                                type="text"
                                inputMode="numeric"
                                value={data.trial_period}
                                onChange={(e) => setData('trial_period', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors?.trial_period} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="trial_interval">Trial Interval</Label>
                            <Select value={data.trial_interval} onValueChange={(value) => setData('trial_interval', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    {intervalOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.trial_interval} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="grace_period">Grace Period</Label>
                            <Input
                                id="grace_period"
                                type="text"
                                inputMode="numeric"
                                value={data.grace_period}
                                onChange={(e) => setData('grace_period', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors?.grace_period} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="grace_interval">Grace Interval</Label>
                            <Select value={data.grace_interval} onValueChange={(value) => setData('grace_interval', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    {intervalOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.grace_interval} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Plan Features</CardTitle>
                                <CardDescription>Define what's included in this plan.</CardDescription>
                            </div>
                            <Button type="button" onClick={addFeature} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Feature
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.features.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">No features added yet. Click "Add Feature" to get started.</div>
                        ) : (
                            data.features.map((feature, index) => (
                                <Card key={index} className="relative">
                                    <CardContent className="pt-6">
                                        <Button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            size="sm"
                                            variant="destructive"
                                            className="absolute top-2 right-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 gap-4 pr-12 sm:grid-cols-2">
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Feature Name *</Label>
                                                <Input
                                                    value={feature.name}
                                                    onChange={(e) => {
                                                        updateFeature(index, 'name', e.target.value);
                                                        // Only auto-generate slug for new features (empty slug)
                                                        if (!feature.slug) {
                                                            updateFeature(index, 'slug', generateSlug(e.target.value));
                                                        }
                                                    }}
                                                    placeholder="API Access"
                                                />
                                                <InputError message={errors?.[`features.${index}.name`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Slug *</Label>
                                                <Input
                                                    value={feature.slug}
                                                    onChange={(e) => updateFeature(index, 'slug', e.target.value)}
                                                    placeholder="api-access"
                                                />
                                                <InputError message={errors?.[`features.${index}.slug`]} />
                                            </div>
                                            <div className="col-span-full flex flex-col gap-1.5">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={feature.description}
                                                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                    placeholder="Feature description..."
                                                    rows={2}
                                                />
                                                <InputError message={errors?.[`features.${index}.description`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Value *</Label>
                                                <Input
                                                    value={feature.value}
                                                    onChange={(e) => updateFeature(index, 'value', e.target.value)}
                                                    placeholder="1000 requests/month"
                                                />
                                                <InputError message={errors?.[`features.${index}.value`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Sort Order</Label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={feature.sort_order}
                                                    onChange={(e) => updateFeature(index, 'sort_order', parseInt(e.target.value) || 0)}
                                                />
                                                <InputError message={errors?.[`features.${index}.sort_order`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Resettable Period</Label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={feature.resettable_period}
                                                    onChange={(e) => updateFeature(index, 'resettable_period', parseInt(e.target.value) || 0)}
                                                />
                                                <InputError message={errors?.[`features.${index}.resettable_period`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Resettable Interval</Label>
                                                <Select
                                                    value={feature.resettable_interval}
                                                    onValueChange={(value) => updateFeature(index, 'resettable_interval', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select interval" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {intervalOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors?.[`features.${index}.resettable_interval`]} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {plan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

PlanForm.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
