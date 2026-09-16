import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = { title: 'Privacy — QuantPath', description: 'How QuantPath handles visitor and AI tutor data.' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy notice" updated="September 16, 2026">
    <section><h2>What QuantPath collects</h2><p>QuantPath does not require accounts. The site stores a random anonymous identifier and daily tutor-usage count in your browser. Current chat messages remain in the page while it is open and are not saved by QuantPath as a conversation history.</p></section>
    <section><h2>AI tutor</h2><p>When you use the tutor, your question, recent messages, and the selected problem context are sent to OpenAI to generate a response. Do not submit names, contact information, employer-confidential material, or other sensitive personal information. QuantPath requests that OpenAI not store the response as application state. OpenAI may retain API content in abuse-monitoring logs under its applicable policies, and API content is not used to train OpenAI models unless the API account owner opts in.</p></section>
    <section><h2>Abuse prevention</h2><p>QuantPath uses an anonymous browser identifier and a one-way hash derived from the visitor’s IP address to enforce usage limits. Raw IP addresses are not intentionally stored by QuantPath. Temporary rate-limit counters may reset as the service infrastructure changes.</p></section>
    <section><h2>Sharing and selling</h2><p>QuantPath does not sell personal information and currently uses no advertising or third-party analytics. Data is shared only with infrastructure providers and OpenAI as needed to operate the site and tutor, or when legally required.</p></section>
    <section><h2>Your choices</h2><p>You can use all problems, hints, and verified solutions without the AI tutor. Clearing this site’s browser storage removes the local anonymous identifier and usage counter.</p></section>
    <section><h2>Changes</h2><p>This notice may change as QuantPath develops. Material changes will be reflected by the date above.</p></section>
  </LegalPage>;
}
