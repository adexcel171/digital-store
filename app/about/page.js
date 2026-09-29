import Link from "next/link";
import { FiShield, FiZap, FiHeadphones, FiArrowRight } from "react-icons/fi";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Express Marketplace";
const SUPPORT_EMAIL = "support@digitalmart.com";

export const metadata = { title: "About", description: `Learn more about ${APP_NAME}.` };

const VALUES = [
  { icon: FiShield, title: "Secure ordering", text: "Every purchase goes through your wallet, with a clear record of each order." },
  { icon: FiZap, title: "Fast processing", text: "Orders are handled quickly, and you can follow the status from your dashboard." },
  { icon: FiHeadphones, title: "Real support", text: "Our team is available 24/7 if something with your order needs attention." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About {APP_NAME}</h1>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-500">
            {APP_NAME} is one organized place to buy social media accounts, pages, premium logins and
            other account resources, with clear ordering and dependable support.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-4 px-6 leading-relaxed text-gray-600">
          <h2 className="text-2xl font-extrabold text-gray-900">What we do</h2>
          <p>
            We put everything in a single panel: browse by category, fund your wallet, place an order
            and track it until delivery.
          </p>
          <p>
            Create a free account to get started. Your buyer dashboard keeps your wallet balance and
            order history together.
          </p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">How we work</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">Questions before you buy?</h2>
          <p className="text-gray-500">
            Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-blue-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            or start browsing.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Go to marketplace <FiArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}