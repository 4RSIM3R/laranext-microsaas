type GuestLayoutProps = {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return <div>{children}</div>;
}