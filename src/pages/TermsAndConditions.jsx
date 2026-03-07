import React from "react";

export default function TermsAndConditions() {
  return (
    <div
      className="min-h-screen w-full text-gray-200 pb-24"
      style={{
        background: 'url("/novachain.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(120deg, #15192ae0 0%, #181c25bb 70%, #101622cc 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-500 to-teal-400 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <div className="bg-[#151c2e]/80 border border-[#24314a] rounded-2xl p-6 md:p-8 space-y-6 text-sm leading-6">
          
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              1. Account Registration & Eligibility
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; By registering an account on NovaChain, you affirm that you are at least 18 years of age and have the legal capacity to enter into this agreement.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Users are strictly prohibited from utilizing the platform for any illegal activities, including but not limited to money laundering, terrorism financing, or fraud.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              2. Account Security
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Users are solely responsible for maintaining the confidentiality of their login credentials and withdrawal passwords. NovaChain Technologies Ltd. will not be held liable for any loss arising from compromised credentials.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; We strongly advise against using easily guessable information (such as birthdays or phone numbers) for account passwords.
              </li>
              <li>
                <span className="font-semibold">(3)</span>&nbsp; If you suspect your account has been compromised, you must immediately contact our official customer support team to initiate an account freeze and password reset.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">3. Funds & Liability</h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; To ensure the highest level of security, all fund transfers are processed systematically. 
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; NovaChain Technologies Ltd. assumes responsibility solely for systemic errors directly originating from our platform's infrastructure. We are not liable for user-generated errors.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">4. Deposits</h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Users are fully responsible for verifying the accuracy of the destination wallet address and the selected network protocol before initiating any deposit.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; The platform is not responsible for, and cannot recover, any digital assets lost due to funds being sent to an incorrect address or via an unsupported blockchain network.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              5. Withdrawals & Compliance
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Withdrawal limits are determined by the user's completed Know Your Customer (KYC) verification level, in strict accordance with international Anti-Money Laundering (AML) regulations.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Standard withdrawal requests are processed systematically. Unusually large withdrawals may require additional manual security review to ensure the safety of user funds.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              6. Operations & Jurisdiction
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Platform trading hours: <span className="font-semibold">24/7</span>
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Online customer service hours: <span className="font-semibold">10:00 to 22:00</span>
              </li>
              <li>
                <span className="font-semibold">(3)</span>&nbsp; Systematic withdrawal processing: <span className="font-semibold">09:00–22:00</span> (UTC-4)
              </li>
              <li>
                <span className="font-semibold">(4)</span>&nbsp; NovaChain Technologies Ltd. reserves the right of final interpretation for all terms stated herein.
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">7. Contact Information</h2>
            <p>
              For legal inquiries or support, please contact our official channel:{" "}
              <a
                href="https://wa.me/16627053615"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                WhatsApp +1 662 705 3615
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}