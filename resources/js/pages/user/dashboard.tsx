import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserLayout from '@/layouts/user-layout';
import { usePage } from '@inertiajs/react';

interface Metrics {
    total_views: number;
    new_leads: number;
    conversion_rate: number;
}

interface DashboardProps {
    metrics: Metrics;
}

export default function UserDashboard() {
    const { metrics } = usePage<DashboardProps>().props;

    return (
        <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Total Views</CardTitle>
                    <CardDescription>Total views of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.total_views.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>New Leads</CardTitle>
                    <CardDescription>Total submissions of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.new_leads.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>Percentage of views that convert</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.conversion_rate}%</div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Expected Revenue</CardTitle>
                    <CardDescription>Coming soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">-</div>
                </CardContent>
            </Card>
        </div>
    );
}

UserDashboard.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;
