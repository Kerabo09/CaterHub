import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{ background: '#1C1F2B', color: '#9CA3AF' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ width: 18, height: 18, background: '#B84922', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', display: 'inline-block' }} />
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>CaterHub</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#9CA3AF' }}>A transparent marketplace for discovering trusted independent caterers and building memorable events.</p>
            <div className="mt-4 flex items-center gap-1.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Trusted Multi-Vendor Network</span>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 12 }}>Marketplace</p>
            <div className="flex flex-col gap-2.5">
              {['Browse Caterers', 'How It Works', 'Event Types'].map(l => (
                <Link key={l} to="/browse" style={{ fontSize: 13, color: '#9CA3AF' }} className="hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* For Caterers */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 12 }}>For Caterers</p>
            <div className="flex flex-col gap-2.5">
              {['List Your Business', 'Partner Resources', 'Verification'].map(l => (
                <Link key={l} to="/for-caterers" style={{ fontSize: 13, color: '#9CA3AF' }} className="hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 12 }}>Company</p>
            <div className="flex flex-col gap-2.5">
              {['About', 'Contact', 'Trust & Safety'].map(l => (
                <Link key={l} to="/contact" style={{ fontSize: 13, color: '#9CA3AF' }} className="hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2D3147', paddingTop: 24 }} className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontSize: 12 }}>© 2026 CaterHub Platform Inc. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Inquiry Standards'].map(l => (
              <Link key={l} to="/contact" style={{ fontSize: 12, color: '#9CA3AF' }} className="hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#6B7280', marginTop: 16, lineHeight: 1.6 }}>
          Legal & Compliance Notice: CaterHub facilitates catering discovery and inquiries only. Booking contracts, menu tastings, service agreements, and payment settlements take place directly between clients and caterers.
        </p>
      </div>
    </footer>
  );
}
