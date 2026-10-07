import React from 'react';
import {
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useVirtualNumber } from '../context/VirtualNumberContext';

interface VerificationStatusAlertProps {
  onSelectAnotherNumber?: () => void;
  onRequestNewCode?: () => void;
}

export const VerificationStatusAlert: React.FC<VerificationStatusAlertProps> = ({
  onSelectAnotherNumber,
  onRequestNewCode,
}) => {
  const {
    verificationState,
    errorDetails,
    cooldownSecondsRemaining,
    isRateLimited,
    lang,
  } = useVirtualNumber();

  if (verificationState === 'idle' || verificationState === 'waiting_otp') {
    return null;
  }

  // Format MM:SS for countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. RATE LIMITED ("Too many attempts") - Requirement 1, 4, 6, 7
  if (verificationState === 'rate_limited') {
    return (
      <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-950/40 p-5 text-rose-100 shadow-xl space-y-3 animate-in fade-in duration-200">
        {/* Raw Google provider error */}
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/50">
                Google 2-Step Verification Error
              </span>
              <span className="text-xs text-rose-300 font-mono">Status: HTTP 429 Too Many Requests</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug">
              &ldquo;You have recently made too many attempts. Please try again later.&rdquo;
            </p>
          </div>
        </div>

        {/* CloudNumber official guidance - Requirement 4 */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-900/60 text-xs leading-relaxed text-slate-200">
          <p className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
            <Info className="w-4 h-4 text-rose-400" />
            CloudNumber Provider Alert:
          </p>
          <p className="text-slate-300">
            Google has temporarily limited verification attempts for this number. Please wait and try again later, or use another legitimate phone number.
          </p>
        </div>

        {/* Cooldown Timer - Requirement 6, 7 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-rose-900/40 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-rose-300">
            <Clock className="w-4 h-4 text-rose-400 animate-spin" />
            <span>Retry Cooldown:</span>
            <span className="text-sm text-white bg-rose-900/80 px-2.5 py-0.5 rounded-lg border border-rose-700/70">
              {formatTime(cooldownSecondsRemaining)}
            </span>
          </div>

          {onSelectAnotherNumber && (
            <button
              type="button"
              onClick={onSelectAnotherNumber}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Use Another Number</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. INVALID PHONE NUMBER
  if (verificationState === 'invalid_number') {
    return (
      <div className="rounded-2xl border-2 border-amber-500/80 bg-amber-950/40 p-5 text-amber-100 shadow-xl space-y-2 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50">
              Google Error: Invalid Phone Number
            </span>
            <p className="text-sm font-bold text-white">
              &ldquo;This phone number format is not recognized. Please check the country code and number.&rdquo;
            </p>
            <p className="text-xs text-amber-200/90 pt-1">
              Google rejected this phone number format. Please ensure you are using an authentic carrier mobile number.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. OTP EXPIRED
  if (verificationState === 'otp_expired') {
    return (
      <div className="rounded-2xl border-2 border-amber-500/80 bg-amber-950/40 p-5 text-amber-100 shadow-xl space-y-3 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50">
              Verification Code Expired
            </span>
            <p className="text-sm font-bold text-white">
              &ldquo;The verification code has expired. Request a new code.&rdquo;
            </p>
            <p className="text-xs text-amber-200/90">
              Google verification codes expire in 10-15 minutes for security. Please request a fresh OTP code below.
            </p>
          </div>
        </div>

        {onRequestNewCode && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onRequestNewCode}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request Fresh Code</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. INCORRECT OTP
  if (verificationState === 'incorrect_otp') {
    return (
      <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-950/40 p-4 sm:p-5 text-rose-100 shadow-xl space-y-2 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/50">
              Google Error: Wrong Code
            </span>
            <p className="text-sm font-bold text-white">
              &ldquo;Wrong code. Try again.&rdquo;
            </p>
            <p className="text-xs text-rose-200/90">
              The verification code entered does not match the code sent by the provider. Please verify the SMS inbox and re-enter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 5. PROVIDER REJECTED NUMBER (VoIP detection)
  if (verificationState === 'provider_rejected') {
    return (
      <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-950/40 p-5 text-rose-100 shadow-xl space-y-3 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/50">
              Google Security Check: Number Rejected
            </span>
            <p className="text-sm font-bold text-white">
              &ldquo;This phone number cannot be used for verification. Please try another number.&rdquo;
            </p>
            <p className="text-xs text-rose-200/90 pt-1">
              Google detected this number as an unsupported VoIP or virtual range. Google 2-Step Verification requires an authentic cellular mobile carrier line.
            </p>
          </div>
        </div>

        {onSelectAnotherNumber && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onSelectAnotherNumber}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Switch to Legitimate Mobile SIM</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 6. VERIFICATION SUCCESSFUL - Requirement 2, 3, 9:
  // "Make sure the application only reports 'Verification Successful' when the actual verification provider returns a successful verification response."
  if (verificationState === 'verified') {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/80 bg-emerald-950/40 p-5 text-emerald-100 shadow-xl space-y-2 animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                Provider Confirmed
              </span>
              <span className="text-xs text-emerald-300 font-mono">Verification Response: 200 OK</span>
            </div>
            <p className="text-base font-extrabold text-white mt-1">
              Verification Successful
            </p>
            <p className="text-xs text-emerald-200/90 pt-0.5">
              Google 2-Step Verification has confirmed this phone number successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
