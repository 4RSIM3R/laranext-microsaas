import SubmissionsTable from '@/components/form/submissions-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import forms from '@/routes/forms';
import formRoutes from '@/routes/user/form';
import { Form } from '@/types/form';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Edit, ExternalLink, Eye, FileText, Settings, TrendingUp } from 'lucide-react';

interface Analytics {
    total_views: number;
    total_submissions: number;
    conversion_rate: number;
    conversion_value: number;
}

interface Props {
    form: Form;
    analytics: Analytics;
}

export default function FormDetail({ form, analytics }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    return (
        <UserLayout>
            <Head title={`${form.name} - Analytics`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={formRoutes.index().url} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Forms
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={formRoutes.show(form.id).url}>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                        <Link href={formRoutes.builder(form.id).url}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Form
                            </Button>
                        </Link>
                        <Link href={forms.public.show(form.slug).url} target="_blank">
                            <Button variant="outline" size="sm">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Form
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Form Info */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold">{form.name}</h1>
                        <Badge variant={form.is_active ? 'default' : 'secondary'}>{form.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    {form.description && <p className="text-muted-foreground">{form.description}</p>}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Slug: {form.slug}</span>
                        <span>Est. Conversion: {formatCurrency(form.est_conversion || 0)}</span>
                        <span>Created: {new Date(form.created_at || '').toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Tabs for Analytics and Submissions */}
                <Tabs defaultValue="analytics" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics" className="space-y-6">
                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Views */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatNumber(analytics.total_views)}</div>
                                    <p className="text-xs text-muted-foreground">Form page visits</p>
                                </CardContent>
                            </Card>

                            {/* Total Submissions */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatNumber(analytics.total_submissions)}</div>
                                    <p className="text-xs text-muted-foreground">Completed submissions</p>
                                </CardContent>
                            </Card>

                            {/* Conversion Rate */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.conversion_rate}%</div>
                                    <p className="text-xs text-muted-foreground">Submissions / Views</p>
                                </CardContent>
                            </Card>

                            {/* Conversion Value */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(analytics.conversion_value)}</div>
                                    <p className="text-xs text-muted-foreground">Submissions × Est. Conversion</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Analytics */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Performance Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Summary</CardTitle>
                                    <CardDescription>Key metrics for your form performance</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Views</span>
                                        <span className="text-sm">{formatNumber(analytics.total_views)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Submissions</span>
                                        <span className="text-sm">{formatNumber(analytics.total_submissions)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Conversion Rate</span>
                                        <span className="text-sm">{analytics.conversion_rate}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Est. Value per Conversion</span>
                                        <span className="text-sm">{formatCurrency(form.est_conversion || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <span className="text-sm font-medium">Total Conversion Value</span>
                                        <span className="text-sm font-bold">{formatCurrency(analytics.conversion_value)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Details</CardTitle>
                                    <CardDescription>Configuration and settings overview</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status</span>
                                        <Badge variant={form.is_active ? 'default' : 'secondary'}>{form.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Pages</span>
                                        <span className="text-sm">{form.pages?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Public URL</span>
                                        <Link
                                            href={forms.public.show(form.slug).url}
                                            target="_blank"
                                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            View <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </div>
                                    {form.embed_code && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Embed Available</span>
                                            <Badge variant="outline">Yes</Badge>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Created</span>
                                        <span className="text-sm">{new Date(form.created_at || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Last Updated</span>
                                        <span className="text-sm">{new Date(form.updated_at || '').toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="submissions">
                        <SubmissionsTable form={form} />
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
