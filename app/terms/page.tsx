import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = { title: 'Terms — QuantPath', description: 'Simple terms for using QuantPath.' };

export default function TermsPage() {
  return <LegalPage title="Terms of use" updated="September 16, 2026">
    <section><h2>Educational use</h2><p>QuantPath provides free educational practice for quantitative interviews. It does not provide financial, investment, employment, legal, or academic advice, and it does not guarantee interview results.</p></section>
    <section><h2>AI limitations</h2><p>The AI tutor may be incomplete or incorrect. Users should treat the human-reviewed solution as the primary reference and independently verify important conclusions.</p></section>
    <section><h2>Acceptable use</h2><p>Do not attempt to bypass usage limits, disrupt the service, extract secrets, automate excessive requests, submit unlawful content, or use QuantPath to violate another person’s rights. Access may be limited or suspended to protect the service and its users.</p></section>
    <section><h2>Problem sources and employer tags</h2><p>The displayed problems are original exercises or original variants. Employer tags identify themes associated with official material or candidate reports; they do not claim that the displayed wording was used by, endorsed by, or affiliated with that employer. Company names and trademarks belong to their respective owners.</p></section>
    <section><h2>Availability and changes</h2><p>QuantPath is provided “as is” without warranties. Features, limits, content, or availability may change or stop at any time. To the extent permitted by law, the project owner is not liable for losses arising from use of the site.</p></section>
    <section><h2>Age and agreement</h2><p>You must be at least 13 years old, or the minimum age required in your country, to use QuantPath. By using the site, you agree to these terms. If you do not agree, do not use the site.</p></section>
  </LegalPage>;
}
