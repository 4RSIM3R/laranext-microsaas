import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { date_format } from '@/lib/format';
import { Subscription } from '@/types/subcription';
import { usePage } from '@inertiajs/react';

interface Props {
    subscription: Subscription;
}

export default function SubcriptionShow() {
    const { subscription } = usePage<Props>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'past_due':
                return 'bg-yellow-100 text-yellow-800';
            case 'trialing':
                return 'bg-blue-100 text-blue-800';
            case 'incomplete':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-semibold">Subscription Details</h1>
                    <p className="text-sm text-gray-500">View subscription information and transaction history</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Subscription ID:</span>
                            <span className="text-sm text-gray-600">{subscription.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Stripe ID:</span>
                            <span className="font-mono text-sm text-gray-600">{subscription.stripe_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <span className="text-sm text-gray-600">{subscription.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <Badge className={getStatusColor(subscription.stripe_status)}>{subscription.stripe_status}</Badge>
                        </div>
                        {subscription.stripe_price && (
                            <div className="flex justify-between">
                                <span className="font-medium">Price ID:</span>
                                <span className="font-mono text-sm text-gray-600">{subscription.stripe_price}</span>
                            </div>
                        )}
                        {subscription.quantity && (
                            <div className="flex justify-between">
                                <span className="font-medium">Quantity:</span>
                                <span className="text-sm text-gray-600">{subscription.quantity}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="font-medium">Created:</span>
                            <span className="text-sm text-gray-600">{date_format(subscription.created_at, 'dd MMM yyyy HH:mm')}</span>
                        </div>
                        {subscription.trial_ends_at && (
                            <div className="flex justify-between">
                                <span className="font-medium">Trial Ends:</span>
                                <span className="text-sm text-gray-600">{date_format(subscription.trial_ends_at, 'dd MMM yyyy HH:mm')}</span>
                            </div>
                        )}
                        {subscription.ends_at && (
                            <div className="flex justify-between">
                                <span className="font-medium">Ends At:</span>
                                <span className="text-sm text-gray-600">{date_format(subscription.ends_at, 'dd MMM yyyy HH:mm')}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription.user && (
                            <>
                                <div className="flex justify-between">
                                    <span className="font-medium">Customer ID:</span>
                                    <span className="text-sm text-gray-600">{subscription.user.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Name:</span>
                                    <span className="text-sm text-gray-600">{subscription.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Email:</span>
                                    <span className="text-sm text-gray-600">{subscription.user.email}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {subscription.items && subscription.items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {subscription.items.map((item, index) => (
                                <div key={item.id} className="rounded-lg border p-4">
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Item ID:</span>
                                                <span className="text-sm text-gray-600">{item.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Stripe ID:</span>
                                                <span className="font-mono text-sm text-gray-600">{item.stripe_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Price ID:</span>
                                                <span className="font-mono text-sm text-gray-600">{item.stripe_price}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {item.stripe_product && (
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Product ID:</span>
                                                    <span className="font-mono text-sm text-gray-600">{item.stripe_product}</span>
                                                </div>
                                            )}
                                            {item.quantity && (
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Quantity:</span>
                                                    <span className="text-sm text-gray-600">{item.quantity}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="font-medium">Created:</span>
                                                <span className="text-sm text-gray-600">{date_format(item.created_at, 'dd MMM yyyy HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

SubcriptionShow.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
