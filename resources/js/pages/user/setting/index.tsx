import UserLayout from "@/layouts/user-layout";

export default function UserSettingIndex() {
    const load = useCallback(async (params: Record<string, any>) => {
        const response = await axios.get<Base<User[]>>(user.fetch().url, {
            params: params,
        });
        return response.data;
    }, []);

    const helper = createColumnHelper<User>();

    const columns: ColumnDef<User, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('email', {
            id: 'email',
            header: 'Email',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.display({
            id: 'created_at',
            header: 'Created At',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => date_format(row.row.original.created_at, 'dd MMM yyyy'),
        }),
        helper.display({
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            enableHiding: false,
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            Action
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                        <Link href={user.show(row.row.original.id).url}>
                            <DropdownMenuItem>
                                <Eye /> Detail
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">User Management</h1>
                    <p className="text-sm text-gray-500">Manage your registered users</p>
                </div>
            </div>
            <NextTable<User> enableSelect={false} load={load} id={'id'} columns={columns} mode="table" />
        </div>
    );
}

UserSettingIndex.layout = (page: React.ReactNode) => <UserLayout>{page}</UserLayout>;