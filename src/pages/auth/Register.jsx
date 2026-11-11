import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingAuthLayout from '../../layouts/LandingAuthLayout';
import {
  MessageCircle,
  Phone,
  Copy,
  Check,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const RAW_PHONE = '0504686941';
const WHATSAPP_URL =
  'https://wa.me/233504686941?text=Hello%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20school%20on%20Goreb.';

export default function RegisterPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(RAW_PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LandingAuthLayout page="register">
      <div className="w-full space-y-6">
        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Get started with Goreb
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            We onboard new schools through a personalized demo and setup walkthrough. Connect with us on WhatsApp to get your school running right away.
          </p>
        </div>

        {/* Primary WhatsApp Action */}
        <div className="space-y-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold py-3.5 px-5 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            <span>Book a Demo on WhatsApp ({RAW_PHONE})</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopyPhone}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy number</span>
                </>
              )}
            </button>

            <a
              href={`tel:${RAW_PHONE}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span>Direct Call</span>
            </a>
          </div>
        </div>

        {/* What to expect */}
        <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            What to expect from your demo
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Full live walkthrough of administrator, teacher, and student portals.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Automated continuous assessment grading and instant report card generation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Assisted onboarding with free student and staff bulk data import.</span>
            </li>
          </ul>
        </div>

        {/* Back to Login */}
        <div className="space-y-1 border-t border-slate-200 pt-5 text-center">
          <p className="text-xs text-slate-600">Already have an active school account?</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-600"
          >
            Sign in to your portal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </LandingAuthLayout>
  );
}
