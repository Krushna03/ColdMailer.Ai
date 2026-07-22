import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Copy, CopyCheckIcon, Loader2, MailOpen, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatBulletPoints, processGeneratedEmail } from '../lib/processGeneratedEmail';
import { useCopyToClipboard, getUserInitial, parseEmail, openGmailCompose } from '../utils';
import { useKeyboardOffset } from '../hooks/useKeyboardOffset';
import { useVoiceInput } from '../hooks/useVoiceInput';

const MAX_TEXTAREA_HEIGHT = 100;

const PLACEHOLDER_SUGGESTIONS = [
  "No additional suggestions found.",
  "Please provide text containing an email and additional content.",
];

export function EmailOutput({
  prompt,
  generatedEmail,
  bottomPrompt,
  setBottomPrompt,
  onUpdate,
  loading,
  updating,
  onBack,
  error
}) {

  const [copied, setCopied] = useState(false);
  const [readMorePrompt, setReadMorePrompt] = useState(false);
  const navigate = useNavigate();
  const keyboardOffset = useKeyboardOffset();
  const mobileTextareaRef = useRef(null);
  const desktopTextareaRef = useRef(null);
  const user = useSelector(state => state.auth.userData);
  const userInitial = getUserInitial(user?.username);

  const {
    listening,
    browserSupportsSpeechRecognition,
    handleMicClick,
    stopListening,
    handleValueChange,
  } = useVoiceInput(bottomPrompt, setBottomPrompt);

  const handleCopyToClipboard = useCopyToClipboard(setCopied);

  const { email, content } = useMemo(
    () => processGeneratedEmail(generatedEmail),
    [generatedEmail]
  );

  const [suggestions, setSuggestions] = useState("");

  useEffect(() => {
    const trimmed = content?.trim();
    if (trimmed && !PLACEHOLDER_SUGGESTIONS.includes(trimmed)) {
      setSuggestions(trimmed);
    }
  }, [content]);

  const formatAdditionalContent = (content) => {
    return formatBulletPoints(content);
  };

  const { subject, body } = useMemo(() => parseEmail(email), [email]);

  const handleGmailCompose = () => {
    openGmailCompose({
      to: user?.email || "",
      subject,
      body,
      userEmail: user?.email,
    });
  };

  const handleUpdateSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (listening) stopListening();
    onUpdate(e);
  };

  const isInputLocked = !!error || updating || loading;
  const isUpdateDisabled = !bottomPrompt.trim() || isInputLocked;
  const isMicDisabled = isInputLocked;

  useEffect(() => {
    if (isMicDisabled && listening) stopListening();
  }, [isMicDisabled, listening, stopListening]);

  // Auto-resize the modification textareas (mobile + desktop share the same behaviour)
  useLayoutEffect(() => {
    [mobileTextareaRef, desktopTextareaRef].forEach((ref) => {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    });
  }, [bottomPrompt]);

  const renderEmailBody = ({ dark = false } = {}) => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-2 ${dark ? "text-brand-200" : "text-blue-900"}`} />
            <p className={`font-medium ${dark ? "text-gray-300" : "text-blue-900"}`}>Generating your email...</p>
          </div>
        </div>
      );
    }
    if (error) {
      const showUpgrade = /upgrade|plan|limit|revision/i.test(error);
      return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center rounded-lg ${dark ? "bg-danger-dark" : "bg-red-50"}`}>
          <div className="max-w-md">
            <h3 className={`font-bold text-lg mb-1 ${dark ? "text-red-300" : "text-brand-deep"}`}>Email Generation Failed</h3>
            <p className={`text-sm whitespace-pre-wrap max-w-xs ${dark ? "text-red-200/80" : "text-brand-deep"}`}>{error}</p>
            {showUpgrade && (
              <> 
              <Button
                onClick={() => navigate("/generated-emails")}
                className="mt-4 mr-3 bg-brand-deep text-white hover:bg-brand-deep/90"
              >
                Create New Email
              </Button>
              <Button
                onClick={() => navigate("/payment")}
                className="mt-4 bg-brand-deep text-white hover:bg-brand-deep/90"
              >
                Upgrade Plan
              </Button>
              </>
            )}
          </div>
        </div>
      );
    }
    return (
      <pre className={`whitespace-pre-wrap font-sans ${dark ? "text-gray-100 text-[14px] leading-relaxed" : "text-black text-xs sm:text-base"}`}>{email}</pre>
    );
  };

  return (
    <>
      {/* ============================= MOBILE LAYOUT ============================= */}
      <div className="sm:hidden flex flex-col pb-28 mt-2">

        {/* Prompt bubble */}
        <div className="flex items-start gap-2.5 mb-4">
          <span className="shrink-0 h-8 w-8 flex items-center justify-center bg-brand-deep rounded-full text-sm font-semibold text-white">
            {userInitial?.toUpperCase()}
          </span>
          <div className="flex-1 bg-surface-800 border border-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
            <p className="text-[15px] leading-relaxed text-gray-200 break-words">
              {!readMorePrompt ? prompt?.slice(0, 160) : prompt}
              {prompt?.length > 160 && (
                <button
                  onClick={() => setReadMorePrompt((v) => !v)}
                  className="ml-1 text-brand-100 font-medium"
                >
                  {readMorePrompt ? "Read less" : "…Read more"}
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Assistant response card */}
        <div className="rounded-2xl overflow-hidden border border-gray-700 bg-surface-850 shadow-lg">
          {/* Card header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-800 bg-surface-800">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/white-logo.png" alt="logo" className="h-6 w-6 p-1 rounded bg-brand-900" />
              <span className="text-xs font-medium text-gray-300 truncate">Generated Email</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleCopyToClipboard(email)}
                disabled={!!error || !email}
                aria-label={copied ? "Copied" : "Copy email"}
                className="h-7 w-7 flex items-center justify-center text-gray-300 bg-surface-900 border border-gray-700 rounded-full active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                {copied ? <CopyCheckIcon className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              </button>
              <button
                onClick={onBack}
                aria-label="Back to input"
                className="flex items-center gap-1 text-xs text-gray-300 bg-surface-900 border border-gray-700 rounded-full px-2.5 py-1.5 active:scale-95 transition-transform"
              >
                <TiArrowBack className="h-3 w-3" />
                Back
              </button>
            </div>
          </div>

          {/* Email content */}
          <div className="relative p-4 min-h-[350px] max-h-[52vh] overflow-y-auto custom-scroll">
            {renderEmailBody({ dark: true })}
          </div>
        </div>

        {/* Additional suggestions */}
        {!error && suggestions?.trim()?.length > 0 && (
          <div className="mt-4 bg-surface-800 border border-gray-800 rounded-2xl p-3.5">
            <p className="text-xs font-semibold text-gray-400 mb-2">Suggestions & tips</p>
            <p className="text-gray-200 whitespace-pre-wrap text-[13.5px] tracking-wide leading-[1.7]">
              {formatAdditionalContent(suggestions)}
            </p>
          </div>
        )}
      </div>

      {/* Portal keeps fixed bar on the viewport — ancestors use transform-gpu / contain:paint */}
      {typeof document !== "undefined" &&
        createPortal(
          <form
            onSubmit={handleUpdateSubmit}
            style={{ bottom: keyboardOffset, paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            className="sm:hidden fixed inset-x-0 z-30 px-3 pt-3 bg-gradient-to-t from-surface-900 via-surface-900 to-transparent transition-[bottom] duration-10"
          >
            <div className="flex items-end gap-2 bg-surface-800 border border-gray-700 rounded-[26px] px-2 py-2 focus-within:border-gray-500 transition-colors">
              <textarea
                ref={mobileTextareaRef}
                rows={1}
                placeholder={listening ? "Listening…" : "Add modifications..."}
                className="flex-1 resize-none bg-transparent text-gray-200 text-base placeholder:text-gray-500 px-2 py-2 max-h-36 overflow-y-auto focus:outline-none custom-scroll disabled:opacity-60"
                value={bottomPrompt}
                onChange={handleValueChange}
                disabled={isInputLocked}
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isMicDisabled}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                aria-pressed={listening}
                title={ browserSupportsSpeechRecognition
                    ? listening
                      ? "Stop listening"
                      : "Speak your prompt"
                    : "Voice input not supported"
                }
                className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${listening ? "bg-red-500/90 hover:bg-red-500 text-white animate-pulse" : "bg-surface-700 hover:bg-surface-600 text-gray-300 border border-gray-600"}`}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="submit"
                disabled={isUpdateDisabled}
                aria-label="Update email"
                className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isUpdateDisabled ? "bg-brand-800 text-gray-400" : "bg-brand-700 text-white"}`}
              >
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
          </form>,
          document.body
        )}

      {/* ============================= DESKTOP / TABLET LAYOUT ============================= */}
      <div className="hidden sm:flex sm:flex-row gap-7 mt-1">

        <div className="sm:w-[63%] flex flex-col">

          <div className="flex justify-start items-center">
            <Button 
              onClick={() => handleCopyToClipboard(email)} 
              className="px-2 bg-none text-base" 
              disabled={!!error || !email}
              size="sm"
            >
              {copied ? (
                <>
                  Copied <CopyCheckIcon className="mt-1 w-4 h-4 text-gray-200" />
                </>
              ) : (
                <>
                  Copy <Copy className="mt-1 w-4 h-4 p-0" />
                </>
              )}
            </Button>

            <Button 
              onClick={handleGmailCompose} 
              className="px-2 bg-none text-base" 
              disabled={!!error || !email}
              size="sm"
            >
              Gmail <MailOpen className="mt-1 w-4 h-4 p-0" />
            </Button>
          </div>

          <div className="bg-surface-850 border border-gray-700 p-5 w-full h-[calc(100dvh-10rem)] overflow-y-auto custom-scroll relative rounded-xl">
            {renderEmailBody({ dark: true })}
          </div>
        </div>

        <div className="w-full sm:w-[37%] flex flex-col h-[calc(100dvh-8rem)]">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex self-start mt-10 mb-2 bg-gray-950 hover:bg-gray-950 text-gray-300 hover:text-gray-200 px-2 h-6 text-xs font-bold"
          >
            <TiArrowBack className='w-4 h-4' />
            Back to Input
          </Button>

          <div className={`flex flex-col flex-1 min-h-0 border border-gray-400 p-2 pb-1 rounded-xl ${readMorePrompt ? "overflow-y-auto custom-scroll" : "overflow-hidden"}`}>
            <p className="bg-surface-600 p-2 text-lg font-normal text-gray-100 rounded-xl flex items-start gap-2 shadow-xl">
              <span className="bg-brand-deep px-3 py-1 rounded-full text-lg">
                {userInitial?.toUpperCase()}
              </span>
              <span className="flex-1 text-[16px]">
                {!readMorePrompt ? `${prompt.slice(0, 170)}` : prompt}
                {prompt?.length > 170 && (readMorePrompt ? (
                  <button onClick={() => setReadMorePrompt(false)} className='text-blue-500 text-base'>
                    Read Less
                  </button>
                ) : (
                  <button onClick={() => setReadMorePrompt(true)} className='text-blue-500 text-base'>
                    Read More
                  </button>
                ))}
              </span>
            </p>

            <div className={`block mt-3 bg-surface-700 shadow-xl p-2 rounded-xl ${readMorePrompt ? "h-auto" : "flex-1 min-h-0 overflow-y-auto custom-scroll"}`}>
              <p className='text-white whitespace-pre-wrap text-[14.5px] tracking-wide leading-[1.7] z-10'>
                {
                  error
                    ? "Could not generate additional suggestions due to the error."
                    : (suggestions?.trim()?.length > 0 ? formatAdditionalContent(suggestions) : "No additional content needed, the email is already generated. Or your request is not clear!")
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateSubmit} className="w-full mt-2 shrink-0">
            <div className="flex items-end gap-2 bg-surface-800 border border-gray-700 rounded-[20px] px-2 py-2 focus-within:border-gray-500 transition-colors">
              <textarea
                ref={desktopTextareaRef}
                rows={2}
                placeholder={listening ? "Listening…" : "Add any specific requirements or modifications..."}
                className="flex-1 resize-none bg-transparent text-gray-200 text-base placeholder:text-gray-500 px-2 py-2 max-h-36 overflow-y-auto focus:outline-none custom-scroll disabled:opacity-60"
                value={bottomPrompt}
                onChange={handleValueChange}
                disabled={isInputLocked}
              />
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isMicDisabled}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                aria-pressed={listening}
                title={
                  browserSupportsSpeechRecognition
                    ? listening
                      ? "Stop listening"
                      : "Speak your prompt"
                    : "Voice input not supported"
                }
                className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${listening ? "bg-red-500/90 hover:bg-red-500 text-white animate-pulse" : "bg-surface-700 hover:bg-surface-600 text-gray-300 border border-gray-600"}`}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                type="submit"
                disabled={isUpdateDisabled}
                aria-label="Update email"
                className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isUpdateDisabled ? 'bg-brand-800 text-gray-400' : 'bg-brand-700 text-white'}`}
              >
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
            {/* {planUsage && (
              <p className="text-center text-xs text-gray-400 mt-1.5">
                {typeof planUsage?.capabilities?.maxRegenerationsPerEmail === 'number' &&
                planUsage.capabilities.maxRegenerationsPerEmail >= 0
                  ? `You can apply up to ${planUsage.capabilities.maxRegenerationsPerEmail} updates per email on the ${planUsage.plan?.name || 'current'}.`
                  : 'Unlimited updates with your current plan.'}
              </p>
            )} */}
          </form>
        </div>
      </div>
    </>
  );
}
