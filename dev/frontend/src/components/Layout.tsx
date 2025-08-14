export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bgPrimary text-textPrimary font-sans">
            <header className="p-4 border-b border-gray-800 flex items-center">
                <h1 className="font-logo text-2xl text-accent">Moosic</h1>
            </header>
            <main className="max-w-5xl mx-auto p-6">{children}</main>
        </div>
    );
}
