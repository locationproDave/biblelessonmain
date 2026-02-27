import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PartyPopper, Mail, CreditCard, Rocket, BookOpen, Target, FileText, Users, Sparkles, Loader2, Frown } from 'lucide-react'

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [details, setDetails] = useState<{
    email?: string;
    amount?: number;
    currency?: string;
  } | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    api.post("/stripe/verify-session", { sessionId })
      .then((response) => {
        const result = response.data;
        if (result.status === "complete" || result.paymentStatus === "paid") {
          setStatus("success");
          setDetails({
            email: result.customerEmail || undefined,
            amount: result.amountTotal ? result.amountTotal / 100 : undefined,
            currency: result.currency?.toUpperCase(),
          });
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="text-center">
          <div className="animate-spin mb-4"><Loader2 className="w-10 h-10 text-amber-600 mx-auto" /></div>
          <p className="text-stone-500 dark:text-stone-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Frown className="w-10 h-10 text-red-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            Payment Issue
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            We couldn&apos;t verify your payment. Don&apos;t worry — if you were charged, please contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Try Again
            </Link>
            <Link
              to="/lessons"
              className="px-6 py-3 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-all duration-200"
            >
              Go to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="text-center max-w-lg">
        {/* Success Animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-ping opacity-30" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-900/20 flex items-center justify-center">
            <PartyPopper className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-emerald-600 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
          Welcome to Bible Lesson Planner!
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 mb-2">
          Your subscription is now active. Time to create amazing Bible lessons!
        </p>

        {details?.email && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" strokeWidth={1.5} /> Confirmation sent to <span className="font-semibold text-stone-900 dark:text-stone-100">{details.email}</span>
          </p>
        )}
        {details?.amount && details?.currency && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 flex items-center justify-center gap-1.5">
            <CreditCard className="w-4 h-4" strokeWidth={1.5} /> Charged: <span className="font-semibold text-stone-900 dark:text-stone-100">{details.currency} ${details.amount.toFixed(2)}</span>
          </p>
        )}

        {/* What's Next */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-8 text-left">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-4 text-center flex items-center justify-center gap-2"><Rocket className="w-5 h-5 text-amber-600" strokeWidth={1.5} /> What&apos;s Next?</h3>
          <div className="space-y-3">
            {[
              { icon: <BookOpen className="w-5 h-5 text-blue-500" strokeWidth={1.5} />, text: 'Generate your first Bible lesson' },
              { icon: <Target className="w-5 h-5 text-purple-500" strokeWidth={1.5} />, text: 'Choose age groups from toddlers to adults' },
              { icon: <FileText className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />, text: 'Export lessons as beautiful PDFs' },
              { icon: <Users className="w-5 h-5 text-amber-500" strokeWidth={1.5} />, text: 'Invite your team to collaborate' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm text-stone-500 dark:text-stone-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/generate"
            className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-600/25 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" strokeWidth={1.5} /> Create Your First Lesson
          </Link>
          <Link
            to="/lessons"
            className="px-6 py-4 border-2 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold rounded-xl hover:bg-white dark:hover:bg-stone-800 transition-all duration-200"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
