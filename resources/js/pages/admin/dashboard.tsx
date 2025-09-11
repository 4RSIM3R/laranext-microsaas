import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

export default function AdminDashboard() {
    return (
        <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>ARR </CardTitle>
                    <CardDescription>Annual Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$100,000</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Calculated since 1 January 2025 - Last updated 11 September 2025</p>
                </CardFooter>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>MRR </CardTitle>
                    <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100,000</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Calculated since 1 January 2025 - Last updated 11 September 2025</p>
                </CardFooter>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                    <CardDescription>Total registered users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100,000</div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Calculated since 1 January 2025 - Last updated 11 September 2025</p>
                </CardFooter>
            </Card>
        </div>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
