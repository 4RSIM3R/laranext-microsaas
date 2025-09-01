type AdminLayoutProps = {
    children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    return <div>{children}</div>;
}