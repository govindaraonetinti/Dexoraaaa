import { StartEarning } from "../components/StartAbcDex";

export default function PrivacyPolicy() {
  return (
    <>
      <section className="py-20 text-white">
        <div className="site-width-sm">

          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-300 mb-8">Last Updated: 21/11/2025</p>


          {/* Acceptance */}
          <Section title="1. Introduction">

            <p>
              Welcome to ABCDEX ("we," "us," or "our"). We respect your privacy and are committed to protecting the personal information you share with us or that we collect. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our website (https://www.google.com/search?q=abcdex.com), interface, and decentralized services (collectively, the "Services"). </p>

            <h3 className="font-bold mt-5 text-xl">a. A Key Note on Decentralization: </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>ABCDEX operates as a non-custodial, decentralized exchange interface. Unlike centralized exchanges, we do not collect your name, physical address, phone number, or passport details (KYC data) to grant you access to the Services. You interact with smart contracts directly via your own non-custodial blockchain wallet. </li>
              <li>By using the Services, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Services. </li>
            </ul>
          </Section>

          {/* Eligibility */}
          <Section title="2.Information We Collect ">
            <p>Due to the decentralized nature of our Services, the types of information we collect are limited. We collect information in the following categories:</p>

            <h3 className="font-bold mt-5 text-xl">a. Information You Provide Voluntarily  </h3>
            <p>Communication Data: If you contact us for support, provide feedback, or participate in our community channels (e.g., Discord, Telegram, Twitter), we may collect your username, email address (if provided), and the contents of your message. </p>

            <h3 className="font-bold mt-5 text-xl">b. Information Collected Automatically (Technical Data) </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>When you access our interface, certain technical information is automatically collected: </li>
              <li>By using the Services, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Services. </li>
              <li> Public Blockchain Data: When you connect your wallet to ABCDEX, we collect your public wallet address and details of your transactions performed through our smart contracts. Please note: Transactions executed on a blockchain are public, immutable, and permanent. We have no control over this publicly available information.</li>

              <li> Device and Usage Data: We may collect information about the device you use to access the Services, such as your IP address, browser type, operating system, access times, and the pages you viewed directly before and after accessing the Services. This data helps us optimize our interface and ensure security.</li>

              <li> Cookies and Similar Technologies: We use cookies and similar tracking technologies to track the activity on our Services and hold certain information. These are used to improve user experience, remembering your preferences (like theme or language settings). You can instruct your browser to refuse all cookies.</li>
            </ul>
          </Section>
          <Section title="3. How We Use Your Information ">
            <p>We use the collected information for specific purposes, including:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>To Provide the Services: Utilizing your public wallet address to facilitate connections to the smart contracts and display your balances and positions on the interface.</li>

              <li>Security and Fraud Prevention: Using IP addresses and device data to detect, prevent, and address technical issues, security breaches, DDoS attacks, or prohibited activities (like accessing from Restricted Jurisdictions).</li>

              <li>To Improve Our Platform: Analyzing aggregated, non-identifiable usage data to understand how users interact with the interface and to improve performance and design.</li>

              <li>To Communicate with You: Using communication data to respond to your inquiries, support requests, or feedback.</li>
            </ul>
          </Section>
          <Section title="4. How We Share Your Information ">
            <p>We do not sell, rent, or trade your information to third parties for marketing purposes. We may share your information in the following limited situations:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Service Providers: We may share technical data (like IP addresses) with third-party vendors, service providers, contractors, or agents who perform services for us, such as website hosting, data analysis (e.g., analytics providers), and security services (e.g., DDoS protection like Cloudflare).</li>

              <li>Legal Obligations: We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or subpoena), though our ability to provide identifying information is limited to the technical data we hold.</li>

              <li>Business Transfers: If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>

              <li>With Your Consent: We may disclose your personal information for any other purpose with your explicit consent.</li>
            </ul>
          </Section>
          <Section title="5. Third-Party Wallets and Blockchains">
            <p>To use our Services, you must use a third-party non-custodial wallet (e.g., MetaMask, Rabby). Your interactions with these wallets and the underlying blockchain network are governed by their respective privacy policies and terms of service. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party wallets or blockchain networks. </p>
          </Section>
          <Section title="6. Data Security ">
            <p>We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission over the Internet or blockchain can be guaranteed against interception or other type of misuse.</p>
            <p>You are solely responsible for maintaining the security of your private keys and wallet seed phrase. </p>
          </Section>
          <Section title="7. Data Retention">
            <p>We retain technical logs and other data only for as long as necessary to fulfill the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law. Please remember that transaction data written to the blockchain is immutable and cannot be deleted. </p>
          </Section>
          <Section title="8. Children's Privacy ">
            <p>Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child under 18 without parental consent, we will take steps to remove that information. </p>
          </Section>
          <Section title="9. Changes to This Privacy Policy">
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes. </p>
          </Section>
          <Section title="10. Contact Us">
            <p>If you have questions or comments about this Privacy Policy, please contact us via our official community channels (e.g., Discord).  </p>
          </Section>

        </div>

      </section>
      <StartEarning btnText="Connect Wallet" title=" Start Trading on ABCDEX" content="Your capital. Your wallet. Your rules. " className="py-16" />
    </>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
