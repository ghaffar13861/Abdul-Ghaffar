import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  XCircle,
  HelpCircle,
  Smartphone,
  Lock,
} from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';

export const ProviderSimulatorConsole: React.FC = () => {
  const {
    activeNumber,
    activeMessages,
    verificationState,
    isRateLimited,
    cooldownSecondsRemaining,
    submitOtpVerification,
    triggerProviderError,
    resetVerificationState,
    selectedService,
  } = useVirtualNumber();

  const [enteredCode, setEnteredCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const currentOtp = activeMessages[0]?.otpCode || '';

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) {
      setSubmissionFeedback(
        'Submission blocked: Google rate limit active. Please wait for cooldown to expire.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    const result = await submitOtpVerification(enteredCode);
    setIsSubmitting(false);
    setSubmissionFeedback(result.message);
  };

  const handleFillExpectedOtp = () => {
    if (currentOtp) {
      setEnteredCode(currentOtp);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-750 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Google 2-Step Verification Testing & Provider Simulation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test how CloudNumber handles real Google verification error responses and rate-limiting limits.
          </p>
        </div>

        <button
          type="button"
          onClick={resetVerificationState}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Reset State
        </button>
      </div>

      {/* Code Submission Box */}
      <form onSubmit={handleSubmitCode} className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Enter OTP to Verify with Google:</span>
            {isRateLimited && (
              <span className="text-[11px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Rate Limited (Submissions Blocked)
              </span>
            )}
          </label>

          {currentOtp && !isRateLimited && (
            <button
              type="button"
              onClick={handleFillExpectedOtp}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Fill Current OTP ({currentOtp})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            disabled={isRateLimited || isSubmitting}
            placeholder={isRateLimited ? 'Submissions locked during rate-limit cooldown' : 'e.g. 431963'}
            value={enteredCode}
            onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="flex-1 bg-slate-900 border border-slate-750 disabled:bg-slate-900/50 disabled:text-slate-500 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-hidden focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isRateLimited || isSubmitting || !enteredCode}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit to Google</span>
              </>
            )}
          </button>
        </div>

        {submissionFeedback && (
          <p className="text-xs text-slate-300 font-medium pt-1">
            {submissionFeedback}
          </p>
        )}
      </form>

      {/* Provider Scenario Simulator Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Simulate Exact Provider Response Scenarios:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {/* 1. Too Many Attempts (Google Rate Limit) */}
          <button
            type="button"
            onClick={() => triggerProviderError('too_many_attempts')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'rate_limited'
                ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Google Rate Limit</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                &ldquo;Too many attempts. Please try again later.&rdquo;
              </p>
            </div>
          </button>

          {/* 2. Provider Rejected Line (VoIP restriction) */}
          <button
            type="button"
            onClick={() => triggerProviderError('provider_rejected')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'provider_rejected'
                ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Provider Rejected Number</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Detected virtual/VoIP range
              </p>
            </div>
          </button>

          {/* 3. Incorrect OTP */}
          <button
            type="button"
            onClick={() => triggerProviderError('incorrect_otp')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'incorrect_otp'
                ? 'bg-amber-950/80 border-amber-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Incorrect OTP Code</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Wrong verification code entered
              </p>
            </div>
          </button>

          {/* 4. OTP Expired */}
          <button
            type="button"
            onClick={() => triggerProviderError('otp_expired')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'otp_expired'
                ? 'bg-amber-950/80 border-amber-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">OTP Expired</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                10-minute code expiry window
              </p>
            </div>
          </button>

          {/* 5. Invalid Phone Format */}
          <button
            type="button"
            onClick={() => triggerProviderError('invalid_number')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'invalid_number'
                ? 'bg-amber-950/80 border-amber-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Invalid Phone Number</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Format unrecognized by Google
              </p>
            </div>
          </button>

          {/* 6. Real Verified Confirmation (Requirement 2, 3, 9) */}
          <button
            type="button"
            onClick={() => triggerProviderError('verified')}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
              verificationState === 'verified'
                ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Provider Confirmed Success</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Only shows verified when confirmed
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
