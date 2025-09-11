import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserLayout from "@/layouts/user-layout";

export default function UserDashboard() {
    return (
        <div className="grid grid-cols-12 gap-4">
           <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Total Views</CardTitle>
                    <CardDescription>Total views of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100</div>
                </CardContent>
           </Card>
           <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>New Leads</CardTitle>
                    <CardDescription>Total submissions of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100</div>
                </CardContent>
           </Card>
           <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>Total submissions of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100</div>
                </CardContent>
           </Card>
           <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Expected Revenue</CardTitle>
                    <CardDescription>Total submissions of your form</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">100</div>
                </CardContent>
           </Card>
        </div>
    )
}

UserDashboard.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;