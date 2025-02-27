import NextAuthWrapper from '@/lib/next.auth.wrapper';

const DRAWER_WIDTH = 240;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
