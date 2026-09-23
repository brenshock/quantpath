import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = { title: 'Privacy — QuantPath', description: 'How QuantPath handles visitor and AI tutor data.' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy notice" updated="September 22, 2026">
    <section><h2>What QuantPath collects</h2><p>QuantPath does not require accounts. The site stores a random anonymous identifier and daily tutor-usage count in your browser. Current chat messages remain in the page while it is open and are not saved by QuantPath as a conversation history.</p></section>
    <section><h2>AI tutor</h2><p>When you use the tutor, your question, recent messages, and the selected problem context are sent to OpenAI to generate a response. Do not submit names, contact information, employer-confidential material, or other sensitive personal information. QuantPath requests that OpenAI not store the response as application state. OpenAI may retain API content in abuse-monitoring logs under its applicable policies, and API content is not used to train OpenAI models unless the API account owner opts in.</p></section>
    <section><h2>Service protection</h2><p>QuantPath processes limited anonymous technical information and short-lived usage counters to keep the service reliable and available. It does not intentionally retain raw network identifiers.</p></section>
    <section><h2>Sharing and selling</h2><p>QuantPath does not sell personal information or use advertising or third-party analytics. Data is shared only with infrastructure providers and OpenAI as needed to operate the site and tutor, or when legally required.</p></section>
    <section><h2>Your choices</h2><p>You can use all problems, hints, and verified solutions without the AI tutor. Clearing this site’s browser storage removes the local anonymous identifier and usage counter.</p></section>
    <section><h2>Changes</h2><p>This notice may change as QuantPath develops. Material changes will be reflected by the date above.</p></section>
  </LegalPage>;
}
