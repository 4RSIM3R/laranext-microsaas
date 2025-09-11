import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface DashboardProps extends SharedData {
    mrr: string;
    arr: string;
    totalUsers: string;
    lastUpdated: string;
}

export default function AdminDashboard() {
    const { mrr, arr, totalUsers, lastUpdated } = usePage<DashboardProps>().props;

    return (
        <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>ARR </CardTitle>
                    <CardDescription>Annual Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${arr}</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Based on current active subscriptions - Last updated {lastUpdated}</p>
                </CardFooter>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>MRR </CardTitle>
                    <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${mrr}</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Current month active subscriptions - Last updated {lastUpdated}</p>
                </CardFooter>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                    <CardDescription>Total registered users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">All registered users - Last updated {lastUpdated}</p>
                </CardFooter>
            </Card>
        </div>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
