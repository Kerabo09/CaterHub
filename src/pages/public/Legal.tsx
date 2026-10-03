import { Link } from 'react-router-dom';

type Kind = 'privacy' | 'terms';

const DOCS: Record<Kind, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy explains what CaterHub collects when you create an account or send an inquiry, and how that information is used.',
    sections: [
      { h: 'Information we collect', p: 'Account details you provide (name, email address, phone number, and, for caterers, business details), the inquiries you send or receive, and a photo of a government-issued ID used for verification.' },
      { h: 'How verification photos are handled', p: 'ID photos are used only to confirm identity. They are stored in a private location, are not shown on any profile, and are visible only to you and authorised CaterHub administrators.' },
      { h: 'How we use information', p: 'To operate your account, show verified caterer profiles, deliver inquiries between customers and caterers, and keep the marketplace safe. We do not sell personal information.' },
      { h: 'Sharing', p: 'When you send an inquiry, the caterer you contacted receives the event details and contact information you submit. Service providers that host our platform process data on our behalf.' },
      { h: 'Your choices', p: 'You may update your profile at any time and may contact us to request correction or deletion of your account information.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'These terms govern your use of CaterHub as a customer or as a catering partner.',
    sections: [
      { h: 'What CaterHub does', p: 'CaterHub helps customers discover independent caterers and send inquiries. Quotes, tastings, contracts and payments are agreed directly between the customer and the caterer; CaterHub is not a party to those agreements and charges no commission.' },
      { h: 'Accounts', p: 'You must provide accurate information, keep your password confidential and be responsible for activity under your account. Caterer accounts are reviewed and verified before a listing is published.' },
      { h: 'Partner verification', p: 'Caterers agree that CaterHub may verify their identity and business details and may remove listings that are inaccurate, misleading or in breach of these terms.' },
      { h: 'Acceptable use', p: 'Do not misuse the platform, impersonate others, submit false inquiries or listings, or attempt to access data that is not yours.' },
      { h: 'Changes', p: 'We may update these terms from time to time. Continued use of CaterHub after an update means you accept the revised terms.' },
    ],
  },
};

export function Legal({ kind }: { kind: Kind }) {
  const d = DOCS[kind];
  return (
    <div className="legal">
      <div className="legal-inner">
        <p className="legal-eyebrow">Legal</p>
        <h1>{d.title}</h1>
        <p className="legal-intro">{d.intro}</p>
        {d.sections.map((s, i) => (
          <section key={s.h}>
            <h2>{i + 1}. {s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
        <p className="legal-foot">Questions? <Link to="/contact">Contact CaterHub</Link>.</p>
      </div>
    </div>
  );
}
