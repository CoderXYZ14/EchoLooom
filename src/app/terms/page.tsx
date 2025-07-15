import { CONTACT_EMAIL } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                By accessing and using EchoLoom, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                EchoLoom is a video conferencing platform that allows users to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Create and join video meetings</li>
                <li>Schedule meetings with participants</li>
                <li>Share screens and collaborate in real-time</li>
                <li>Manage meeting history and recordings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Responsibilities
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                As a user of EchoLoom, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Respect the rights and privacy of other users</li>
                <li>Not misuse or attempt to disrupt the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Prohibited Activities
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may not use EchoLoom to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share inappropriate or offensive content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>
                  Use the service for commercial purposes without permission
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                The EchoLoom service and its original content, features, and
                functionality are owned by EchoLoom and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the service, to
                understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Disclaimers and Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                EchoLoom is provided &quot;as is&quot; without any
                representations or warranties. We do not guarantee uninterrupted
                or error-free service. To the fullest extent permitted by law,
                we disclaim all warranties and shall not be liable for any
                indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may terminate or suspend your account and access to the
                service immediately, without prior notice, for conduct that we
                believe violates these Terms of Service or is harmful to other
                users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about these Terms of Service, please
                contact us at:{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
