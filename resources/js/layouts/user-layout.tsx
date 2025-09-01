type UserLayoutProps = {
    children: React.ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
    return <div>{children}</div>;
}
