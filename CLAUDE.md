# Funnel Form SaaS - Product Requirements Document

## Project Overview

A comprehensive SaaS platform for creating, managing, and analyzing multi-page funnel forms. Users can build complex forms with conditional logic, collect leads, and analyze performance metrics.

## Tech Stack

- **Backend**: Laravel 12, PostgreSQL
- **Frontend**: React, Inertia.js, Tailwind CSS, shadcn/ui
- **Routing**: Ziggy
- **Payment**: Laravel Cashier + Stripe
- **Analytics**: Meta Pixel, Google Analytics integration

## Core Architecture

### Data Hierarchy

```
Form (Top Level)
├── Meta information (name, description, tracking codes)
├── Configuration (theme, redirects, notifications)
└── Pages[]
    ├── Page logic (conditions, redirects)
    └── Fields[]
        ├── Field type (text, email, number, checkbox, etc.)
        ├── Validation rules
        └── Display conditions
```

## Admin Panel Features

### 1. Dashboard

- **Metrics Display**:
    - ARR (Annual Recurring Revenue)
    - MRR (Monthly Recurring Revenue)
    - Total active users
    - Churn rate
    - Growth metrics with charts
- **Recent Activity**: New signups, cancellations, high-value customers

### 2. Plan & Feature Management

- **Plan CRUD**: Create, edit, delete subscription plans
- **Feature Management**: Define features with keys for metering
- **Pricing Configuration**: Monthly/yearly pricing, trial periods
- **Feature Limits**: Set quotas per plan (forms, submissions, etc.)

### 3. User Management

- **User List**: Searchable, filterable user directory
- **User Details**: Subscription status, usage metrics, activity log
- **Quota Monitoring**: Track usage against plan limits
- **Account Actions**: Suspend, upgrade, downgrade users

### 4. Transaction Management

- **Payment History**: All Stripe transactions
- **Subscription Lifecycle**: Active, canceled, past due subscriptions
- **Manual Actions**: Refunds, adjustments, manual renewals
- **Failed Payments**: Retry logic and notifications

### 5. System Settings

- **Key-Value Configuration**: System-wide settings
- **Email Templates**: Transactional email customization
- **Integration Settings**: Stripe keys, analytics configurations
- **Feature Flags**: Enable/disable platform features

## End-User Features

### 1. User Dashboard

- **Welcome Section**: Personalized greeting, quick actions
- **Analytics Overview**:
    - Total forms created
    - Aggregate views across all forms
    - Total submissions received
    - Overall conversion rate
- **Recent Activity**: Latest submissions, form performance alerts
- **Quick Actions**: Create new form, view recent leads

### 2. Form Management

- **Form List**: Grid/table view of all user forms
- **Form Actions**:
    - Create new form
    - Duplicate existing form
    - Archive/delete forms
    - Toggle form active status
- **Form Metrics**: Views, submissions, conversion rate per form
- **Public Link Sharing**: Generate and manage shareable URLs

### 3. Form Builder

- **Visual Editor**: Drag-and-drop interface for form creation
- **Page Management**:
    - Add/remove pages
    - Configure page transitions
    - Set conditional logic
- **Field Configuration**:
    - Field types: text, email, number, phone, checkbox, radio, select, textarea
    - Validation rules setup
    - Conditional field display
    - Custom styling options
- **Theme Customization**: Colors, fonts, layout options
- **Integration Setup**: Meta Pixel, Google Analytics tracking codes

### 4. Form Analytics & Lead Management

- **Detailed Analytics**:
    - Page-by-page conversion funnel
    - Time-based performance metrics
    - Traffic source analysis
    - Device/browser breakdown
- **Lead Management**:
    - Submission data table with filtering
    - Individual submission details
    - Lead scoring and tagging
    - Export capabilities (CSV, Excel)

## Security & Compliance

### Data Protection

- **GDPR Compliance**: Data export, deletion requests
- **Rate Limiting**: API and form submission limits
- **CSRF Protection**: Laravel's built-in CSRF tokens
- **Input Validation**: Comprehensive validation for all inputs

### Performance Optimization

- **Database Indexing**: Strategic indexes on frequently queried columns
- **Caching Strategy**: Redis for session data, query results
- **Asset Optimization**: Minified CSS/JS, image optimization
- **CDN Integration**: Static asset delivery

## Key Implementation Notes

1. **Form Rendering**: Create a flexible component system that can render any form structure from JSON configuration
2. **Conditional Logic**: Implement a rules engine for showing/hiding fields and pages based on user input
3. **Analytics**: Use database triggers or scheduled jobs to maintain analytics summaries for performance
4. **Quota Enforcement**: Middleware to check plan limits before form creation/submission
5. **Multi-tenancy**: Ensure proper user isolation in all queries and operations

## Architecture & Coding Patterns

### Backend Architecture

#### Service Layer Pattern

- **Service Classes**: All business logic lives in service classes extending `BaseService`
- **Contract/Interface Pattern**: Each service implements a contract interface for dependency injection
- **Dependency Injection**: Services are bound to contracts in `ContractProvider`
- **Multi-tenancy Support**: Services use `$guardForeignKey` for automatic user isolation

```php
// Service Example
class FormService extends BaseService implements FormContract
{
    protected string|null $guard = 'user';
    protected string|null $guardForeignKey = 'user_id';
    protected array $relation = ['pages', 'pages.fields'];

    public function __construct(Form $model)
    {
        $this->model = $model;
    }
}
```

#### Controller Pattern

- **Thin Controllers**: Controllers only handle HTTP concerns, delegate to services
- **Inertia Rendering**: Use `Inertia::render()` for page responses
- **Separate Fetch Endpoints**: Data fetching separated from page rendering
- **Form Requests**: Use dedicated request classes for validation
- **WebResponse Utility**: Standardized response handling

```php
// Controller Example
class FormController extends Controller
{
    private FormContract $service;

    public function __construct(FormContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('user/form/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name', 'status'],
            sorts: ['name', 'created_at'],
            paginate: true,
            per_page: request()->get('per_page', 10)
        );
        return response()->json($data);
    }
}
```

#### Database & Models

- **Eloquent Models**: Standard Laravel models with proper relationships
- **Mass Assignment**: Use `$fillable` for allowed attributes
- **Type Casting**: Use `$casts` for proper data types
- **Relationships**: Define explicit relationship methods
- **Helper Methods**: Add business logic methods to models

```php
// Model Example
class Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'settings', 'user_id'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class)->orderBy('sort_order');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

#### Routing Structure

- **Modular Routes**: Separate route files by feature/context
- **Route Groups**: Use middleware and prefix grouping
- **Named Routes**: Always use route names for consistency
- **RESTful Patterns**: Follow REST conventions where applicable

```php
// Route Example
Route::group([
    'middleware' => 'auth:user',
    'prefix' => 'dashboard/forms',
    'as' => 'forms.'
], function () {
    Route::get('', [FormController::class, 'index'])->name('index');
    Route::get('fetch', [FormController::class, 'fetch'])->name('fetch');
    Route::get('create', [FormController::class, 'create'])->name('create');
    Route::post('store', [FormController::class, 'store'])->name('store');
    Route::get('{id}', [FormController::class, 'show'])->name('show');
    Route::put('{id}', [FormController::class, 'update'])->name('update');
    Route::delete('{id}', [FormController::class, 'destroy'])->name('destroy');
});
```

### Frontend Architecture

#### Component Structure

- **Page Components**: Inertia page components with layout assignment
- **Reusable Components**: Shared components in `/components` directory
- **shadcn/ui**: Use shadcn components as base UI building blocks
- **TypeScript**: All components and types are fully typed

```tsx
// Page Component Example
export default function FormIndex() {
    const load = useCallback(async (params: Record<string, any>) => {
        const response = await axios.get<Base<Form[]>>(forms.fetch().url, {
            params: params,
        });
        return response.data;
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">Forms</h1>
                    <p className="text-sm text-gray-500">Manage your forms</p>
                </div>
                <Link href={forms.create().url}>
                    <Button>
                        <Plus className="size-4" />
                        Add Form
                    </Button>
                </Link>
            </div>
            <NextTable<Form> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

FormIndex.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;
```

#### Data Management

- **Type Definitions**: Comprehensive TypeScript interfaces
- **API Integration**: Axios for HTTP requests
- **Table Components**: `NextTable` for data display with pagination/filtering
- **Route Helpers**: Generated route helpers for type-safe navigation

```typescript
// Type Definition Example
export type Form = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    settings: FormSettings;
    is_active: boolean;
    user_id: number;
    created_at?: string;
    updated_at?: string;
    pages?: Page[];
};

export type FormSettings = {
    theme: ThemeConfig;
    notifications: NotificationConfig;
    tracking: TrackingConfig;
};
```

### Data Flow Patterns

#### CRUD Operations

1. **List View**: Page component + separate fetch endpoint
2. **Create/Edit**: Form component with validation
3. **Delete**: Confirmation dialog with service call
4. **Bulk Operations**: Selection state with batch processing

#### Pagination & Filtering

- **Server-side**: All pagination/filtering handled by `BaseService`
- **Query Builder**: Uses Spatie QueryBuilder for flexible filtering
- **Frontend State**: `NextTable` manages UI state and API calls
- **URL Params**: Filter/sort state reflected in URL

#### Error Handling

- **Service Layer**: Return exceptions for error states
- **Controller Layer**: Use `WebResponse` utility for consistent responses
- **Frontend**: Display error states in components
- **Validation**: Laravel Form Requests with frontend error display

### File Organization

```
app/
├── Contract/           # Service interfaces
├── Service/           # Business logic services
├── Http/
│   ├── Controllers/   # HTTP request handlers
│   └── Requests/      # Form validation classes
├── Models/            # Eloquent models
└── Utils/             # Helper utilities

resources/js/
├── components/        # Reusable UI components
├── pages/            # Inertia page components
├── types/            # TypeScript definitions
├── routes/           # Route helper functions
└── layouts/          # Page layout components
```

### Security & Performance

#### Multi-tenancy

- **Guard-based Isolation**: Services automatically filter by user
- **Middleware Protection**: Route-level authentication
- **Query Scoping**: All queries scoped to authenticated user

#### Performance

- **Eager Loading**: Define relationships in service `$relation` property
- **Pagination**: Always paginate large datasets
- **Caching**: Use Laravel's built-in caching where appropriate
- **Database Indexes**: Strategic indexing on foreign keys and search fields
