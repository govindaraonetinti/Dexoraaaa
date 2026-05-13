import { StartEarning } from "../components/StartAbcDex";

export default function TermsAndConditions() {
    return (
        <>
            <section className="py-20 text-white">
                <div className="site-width-sm">

                    <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
                    <p className="text-gray-300 mb-8">Last Updated: 21/11/2025</p>

                    {/* Important Notice */}
                    <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl mb-12 space-y-5">
                        <p className="font-semibold text-red-300 mb-3">
                            IMPORTANT NOTICE:
                        </p>
                        <p className="text-gray-200">
                            THESE TERMS CONTAIN A BINDING ARBITRATION PROVISION AND WAIVER OF CLASS ACTION RIGHTS. PLEASE READ CAREFULLY.
                        </p>
                        <p>FURTHERMORE, TRADING CRYPTOCURRENCY DERIVATIVES AND PERPETUAL CONTRACTS INVOLVES A SUBSTANTIAL RISK OF LOSS AND IS NOT SUITABLE FOR EVERYONE. LEVERAGED TRADING CAN RESULT IN LOSSES THAT EXCEED YOUR INITIAL DEPOSIT.  </p>
                    </div>

                    {/* Acceptance */}
                    <Section title="1. Acceptance of Terms">

                        <p>
                           Welcome to ABCDEX. These Terms of Service (the "Terms") constitute a legally binding agreement between you (the "User" or "you") and ABCDEX Operators (referred to as "ABCDEX," "we," "us," or "our"), governing your access to and use of the ABCDEX website [website name], application interface, decentralized protocol, smart contracts, and related services (collectively, the "Services" or "Platform"). 
                        </p>
                        <p>By accessing the Platform, connecting your wallet, or using the Services, you expressly acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you are not authorized to access or use the Services. </p>
                    </Section>

                    {/* Eligibility */}
                    <Section title="2. Eligibility and Restrictions">
                        <p>By using ABCDEX, you represent and warrant that:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Age: You are at least 18 years old or of legal age to form a binding contract under applicable law. </li>
                            <li>Capacity: You have the full right, power, and authority to enter into these Terms. </li>
                            <li>
                                Restricted Jurisdictions: You are NOT a resident, citizen, national, or agent of, nor are you accessing the Platform from,
                                the United States of America, Canada, North Korea, Iran, Syria, Cuba, the Crimea region, or any other jurisdiction where
                                the access or use of the Services is prohibited or restricted by applicable laws, decrees, regulations, treaties, or administrative acts
                                (collectively, "Restricted Jurisdictions"). We reserve the right to block access from any prohibited IP addresses.
                            </li>
                            <li>Sanctions: You are not currently the subject of any economic sanctions administered or enforced by any governmental authority
                                (e.g., OFAC, UN Security Council). </li>
                        </ul>
                    </Section>

                    {/* Nature of Service */}
                    <Section title="3. The Nature of the Services (Non-Custodial) ">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>ABCDEX is a non-custodial decentralized exchange interface. </li>
                            <li>No Custody: We do not hold, take custody of, or control your cryptocurrency assets. Your assets remain in your own blockchain-based wallet (e.g., MetaMask) at all times until a trade is executed via smart contracts. </li>
                            <li>Smart Contracts: The Platform facilitates interactions with decentralized smart contracts. You acknowledge that ABCDEX has no control over your transactions once they are submitted to the blockchain. </li>
                            <li>Your Responsibility: You are solely responsible for the security of your wallet, private keys, and seed phrases. ABCDEX is not liable for any losses arising from compromised wallets or user error. </li>
                        </ul>
                    </Section>

                    {/* Risks */}
                    <Section title="4. Risk Disclosure (Read Carefully) ">
                        <p>Trading on ABCDEX involves significant risks. You accept and agree that: </p>
                        <ul className="list-disc pl-6 space-y-4">
                            <li>Risk of Loss: Cryptocurrency markets are extremely volatile. The value of your assets can drop significantly or become worthless. You should only trade with funds you can afford to lose entirely. </li>
                            <li>Leverage Risk: ABCDEX offers leveraged trading. While leverage can amplify gains, it can also amplify losses greatly. A small market movement against your position may result in the immediate and total liquidation of your position and margin collateral. </li>
                            <li>Liquidation: If your margin balance falls below the required maintenance margin, your position will be automatically liquidated by the protocol’s smart contracts without prior notice. You are solely responsible for monitoring your positions. </li>
                            <li>Protocol and Smart Contract Risk: The Platform relies on complex software and smart contracts. While we strive for security, there is an inherent risk of bugs, exploits, hacks, or unforeseen failures in the code that could lead to a loss of funds. </li>
                            <li>Oracle Risk: The Platform relies on external price feeds ("Oracles") to determine market prices and trigger liquidations. If an Oracle malfunctions, provides incorrect data, or is manipulated, it may result in improper liquidations or losses. </li>
                            <li>Regulatory Risk: The regulatory status of DeFi and crypto derivatives is uncertain and evolving. Changes in laws or regulations in your jurisdiction could adversely affect your ability to use the Services or the value of your assets. </li>
                        </ul>
                    </Section>

                    {/* Prohibited Activities */}
                    <Section title="5. Prohibited Activities">
                        When using the Services, you agree not to:

                        <ul className="list-disc pl-6 space-y-2">
                            <li>Engage in any form of market manipulation, including but not limited to "wash trading," "spoofing," or "front-running." </li>
                            <li>Use the Platform for money laundering, terrorist financing, or any other illegal activity. </li>
                            <li>Attempt to circumvent any content filtering techniques or security measures that ABCDEX employs. </li>
                            <li>Use any robot, spider,crawler, scraper, or other automated means or interface not provided by us to access the Services or to extract data. </li>
                            <li>Introduce any malware, virus, or other harmful material to the Platform. </li>
                            <li>Exploit, find, or publicly disclose any bug or vulnerability in the Platform's smart contracts without first reporting it to us through proper channels. </li>
                        </ul>
                    </Section>

                    {/* Fees */}
                    <Section title="6. Fees and Funding Rates">
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Trading Fees: You agree to pay all applicable fees related to your use of the Services, including trading fees (maker/taker fees) and blockchain network gas fees.</li>
                            <li>Funding Rates: Perpetual contracts on ABCDEX are subject to periodic funding payments. Funding rates fluctuate based on market conditions. You may either receive or be required to pay funding fees depending on your open positions. These are automatically deducted from or added to your margin balance.
                                ABCDEX reserves the right to adjust fee structures and funding mechanisms at any time. </li>
                        </ul>
                    </Section>

                    {/* IP */}
                    <Section title="7. Intellectual Property">
                        <p>
                            The ABCDEX brand, logo, website design, text, graphics, code, and all other content on the Platform are the intellectual property of ABCDEX or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any content from the Platform without our prior written consent.
                        </p>
                    </Section>

                    {/* Liability */}
                    <Section title="8. Disclaimers and Limitation of Liability">
                        <p className="mb-4">
                            THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ABCDEX, ITS OPERATORS, AFFILIATES, EMPLOYEYS, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                        </p>

                        <ul className="list-disc pl-6 space-y-2 mt-3">
                            <li>(A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES;</li>
                            <li>(B) ANY HACKING, TAMPERING, OR OTHER UNAUTHORIZED ACCESS TO THE PLATFORM OR YOUR WALLET;</li>
                            <li>(C) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT MAY BE TRANSMITTED TO OR THROUGH OUR SERVICES;</li>
                            <li>(D) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT OR DATA (INCLUDING ORACLE DATA);</li>
                            <li>(E) THE DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY.</li>
                        </ul>
                    </Section>

                    {/* Indemnification */}
                    <Section title="9. Indemnification">
                        <p>
                            You agree to defend, indemnify, and hold harmless ABCDEX, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services.
                        </p>
                    </Section>

                    {/* Governing Law */}
                    <Section title="9. Governing Law and Dispute Resolution">
                        <p>(Note: You need to select a jurisdiction, often a crypto-friendly one in reality. For this template, we will use generic language).</p>
                        <p> These Terms shall be governed by and construed in accordance with the laws of [Insert Favorable Jurisdiction, e.g., Panama, Seychelles, etc.], without regard to its conflict of law principles.</p>
                        <p>Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by binding arbitration in accordance with the rules of [Insert Arbitration Body]. The number of arbitrators shall be one. The seat, or legal place, of arbitration shall be [Insert Jurisdiction]. The language to be used in the arbitral proceedings shall be English. </p>
                    </Section>

                    {/* Amendments */}
                    <Section title="10. Amendments">
                        <p>
                            We reserve the right to modify or replace these Terms at any time in our sole discretion. If a revision is material, we will provide notice on the Platform. By continuing to access or use the Services after those revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </Section>

                    {/* Contact */}
                    <Section title="11. Contact Us">
                        <p>
                            If you have any questions about these Terms, please contact us via our official Discord server or social media channels linked on the https://www.google.com/search?q=abcdex.com website.
                        </p>
                    </Section>

                </div>

            </section>
            <StartEarning btnText="Connect Wallet" title=" Start Trading on ABCDEX" content="Your capital. Your wallet. Your rules. " className="pb-24" />
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
