import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/** Page frame: navigation on top, footer at the bottom. */
export function Layout({ children, hideFooter }: { children: ReactNode; hideFooter?: boolean }) {
  return (
    <div className="site-frame">
      <Navbar />
      <main className="site-main">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
