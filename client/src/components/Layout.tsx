import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-foam-100">
      <Header />
      {/* No top padding: the header floats over full-bleed page heroes.
          Pages without a hero add their own top spacing. */}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
