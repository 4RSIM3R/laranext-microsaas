import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

interface EmbedLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function EmbedLayout({ children, title = 'Form' }: EmbedLayoutProps) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-background">
                <main className="p-4">{children}</main>
            </div>
        </>
    );
}
