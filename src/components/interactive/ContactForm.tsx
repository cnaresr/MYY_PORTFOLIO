"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
} from "react";

import { AlertCircle, ChevronRight, Loader2, Send } from "lucide-react";

import { cn } from "@/lib/utils";

/** React 19 deprecates the `FormEvent` alias; this is its DOM-native shape. */
type SubmitEvent = SyntheticEvent<HTMLFormElement>;

/** RFC-5322 is overkill here — this rejects the obvious malformed cases. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Topics mirror the inquiry taxonomy the API stores against each dispatch. */
const TOPICS = [
  "Fractional Architecture Advisory",
  "Full-Stack Greenfield Contract",
  "Technical Due Diligence",
  "Keynote / Tech Talk",
  "Other High-Priority Query",
] as const;

type ContactFormValues = Readonly<{
  name: string;
  email: string;
  topic: string;
  message: string;
}>;

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

/** Shape returned by POST /api/inquiries/submit. */
type SubmitResult = {
  success?: boolean;
  emailSent?: boolean;
  emailNote?: string;
  error?: string;
};

export type ContactFormProps = Readonly<
  {
    title?: string;
    subtitle?: string;
    submitLabel?: string;
    successTitle?: string;
    successMessage?: string;
    submitErrorMessage?: string;
    maxMessageLength?: number;
    /** Endpoint the dispatch is POSTed to. */
    endpoint?: string;
    /** Mailbox used for the mailto fallback when SMTP is not configured. */
    fallbackEmail?: string;
    /** Display name injected into the success copy. */
    siteName?: string;
    onSubmit?: (values: ContactFormValues) => void | Promise<void>;
  } & Omit<ComponentPropsWithoutRef<"form">, "onSubmit">
>;

function validateContact(
  values: ContactFormValues,
  maxLength: number,
): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const topic = values.topic.trim();
  const message = values.message.trim();

  if (name.length < 2) errors.name = "Please enter your name.";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!topic) errors.topic = "Select a topic of discussion.";
  if (message.length < 10)
    errors.message = "Message must be at least 10 characters.";
  else if (message.length > maxLength)
    errors.message = `Message cannot exceed ${maxLength} characters.`;

  return errors;
}

/**
 * Portfolio inquiry console, rebuilt as a hydrated React island.
 *
 * Follows the reference contact-form shape — per-field errors, honeypot,
 * char counter, busy and success states — but re-themed to the slate /
 * Space-Grotesk design language and wired to the existing Astro API route.
 */
export const ContactForm = forwardRef<HTMLDivElement, ContactFormProps>(
  function ContactForm(
    {
      className,
      title = "Secure Transmission Console",
      subtitle = "Outline technical objectives, timeline constraints, and scope.",
      submitLabel = "Send",
      successTitle = "Message Received",
      successMessage = "Your message has been stored and dispatched.",
      submitErrorMessage = "Your message wasn't sent. Please try again.",
      maxMessageLength = 1000,
      endpoint = "/api/inquiries/submit",
      fallbackEmail = "",
      siteName = "The owner",
      onSubmit,
      onReset,
      ...props
    },
    ref,
  ) {
    const formId = useId();
    const honeypotRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState<string>(TOPICS[0]);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [transmissionPhase, setTransmissionPhase] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const busy = submitting;
    const messageLimit = Math.max(10, Math.floor(maxMessageLength));

    const clearError = useCallback((key: keyof ContactFormValues) => {
      setSubmitError("");
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }, []);

    const handleSubmit = useCallback(
      async (event: SubmitEvent) => {
        event.preventDefault();
        if (busy || success) return;

        // Bots fill every field they find; real users never see this one.
        if (honeypotRef.current?.value.trim()) {
          setSuccess(true);
          return;
        }

        const values: ContactFormValues = { name, email, topic, message };
        const nextErrors = validateContact(values, messageLimit);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const payload: ContactFormValues = {
          name: name.trim(),
          email: email.trim(),
          topic: topic.trim(),
          message: message.trim(),
        };

        setSubmitting(true);
        setSubmitError("");

        // Sequential Terminal Transmission Sequence
        setTransmissionPhase("ENCRYPTING PACKET [AES-256]…");
        await new Promise((resolve) => setTimeout(resolve, 320));

        setTransmissionPhase("DISPATCHING PAYLOAD [TLS 1.3]…");
        try {
          if (onSubmit) {
            await onSubmit(payload);
            setTransmissionPhase("TRANSMISSION CONFIRMED [ACK 200]");
            await new Promise((resolve) => setTimeout(resolve, 300));
            setSuccess(true);
          } else {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = (await res.json().catch(() => ({}))) as SubmitResult;
            if (!res.ok && !json.success) {
              throw new Error(json.error || "Submission failed");
            }

            setTransmissionPhase("TRANSMISSION CONFIRMED [ACK 200]");
            await new Promise((resolve) => setTimeout(resolve, 300));

            const sent = Boolean(json.emailSent);
            setEmailSent(sent);
            setSuccess(true);

            // SMTP may not be configured; open a mailto draft so the message
            // still reaches the owner's mailbox without server mail setup.
            if (!sent && fallbackEmail) {
              const subject = encodeURIComponent(
                `[INQUIRY] ${payload.topic} - From ${payload.name}`,
              );
              const body = encodeURIComponent(
                `Sender: ${payload.name} (${payload.email})\nTopic: ${payload.topic}\n\nScope:\n${payload.message}`,
              );
              window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
            }
          }
        } catch {
          setSubmitError(submitErrorMessage);
        } finally {
          setSubmitting(false);
          setTransmissionPhase(null);
        }
      },
      [
        busy,
        email,
        endpoint,
        fallbackEmail,
        message,
        messageLimit,
        name,
        onSubmit,
        submitErrorMessage,
        success,
        topic,
      ],
    );

    const handleReset = useCallback(
      (event: SubmitEvent) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        setName("");
        setEmail("");
        setTopic(TOPICS[0]);
        setMessage("");
        setErrors({});
        setSubmitError("");
        setTransmissionPhase(null);
      },
      [onReset],
    );

    const fieldClass = (invalid: boolean) =>
      cn(
        "w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all",
        invalid
          ? "border-rose-300 dark:border-rose-500 focus:ring-rose-400"
          : "border-slate-200 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-slate-300 focus:bg-white dark:focus:bg-slate-800",
      );

    if (success) {
      return (
        <div
          ref={ref}
          data-slot="contact-form"
          data-success
          role="status"
          aria-live="polite"
          className={cn(
            "p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl relative",
            className,
          )}
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs"></span>
            <span className="font-['Space_Grotesk'] text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-bold">
              Transmission Confirmed [ACK 200]
            </span>
            <span className="ml-auto font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              TLS 1.3 SECURE
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-[28px] shrink-0">
              check_circle
            </span>
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                {successTitle}
              </h2>
              <p className="mt-2 font-['Hanken_Grotesk'] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {successMessage}
              </p>
              <p className="mt-1 font-['Hanken_Grotesk'] text-xs text-slate-500 dark:text-slate-400">
                {emailSent
                  ? `Your message has been sent to the inbox. ${siteName} responds within 12–24 business hours.`
                  : "Message received and stored. (Email delivery is being configured on the server.)"}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setTransmissionPhase(null);
                  setName("");
                  setEmail("");
                  setTopic(TOPICS[0]);
                  setMessage("");
                }}
                className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold transition-colors cursor-pointer select-none"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Send Another Dispatch
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl relative",
          className,
        )}
      >
        <form
          data-slot="contact-form"
          aria-busy={busy}
          noValidate
          onSubmit={handleSubmit}
          onReset={handleReset}
          className="space-y-4"
          {...props}
        >
          {/* Honeypot: visually hidden, ignored by humans, tempting to bots. */}
          <input
            ref={honeypotRef}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="sr-only"
          />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-100 shadow-xs"></span>
              <span className="font-['Space_Grotesk'] text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-bold">
                {title}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-medium">
              TLS 1.3 ENCRYPTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="block font-['Space_Grotesk'] text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold mb-1.5"
              >
                Sender Name &amp; Role
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                disabled={busy}
                value={name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? `${formId}-name-error` : undefined
                }
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                className={fieldClass(Boolean(errors.name))}
                placeholder="Jane Doe / Tech Lead / Founder"
              />
              {errors.name ? (
                <p
                  id={`${formId}-name-error`}
                  role="alert"
                  className="mt-1.5 font-['Hanken_Grotesk'] text-xs text-rose-600 dark:text-rose-400"
                >
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor={`${formId}-email`}
                className="block font-['Space_Grotesk'] text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold mb-1.5"
              >
                Sender Email Address
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                disabled={busy}
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? `${formId}-email-error` : undefined
                }
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearError("email");
                }}
                className={fieldClass(Boolean(errors.email))}
                placeholder="jane@company.com"
              />
              {errors.email ? (
                <p
                  id={`${formId}-email-error`}
                  role="alert"
                  className="mt-1.5 font-['Hanken_Grotesk'] text-xs text-rose-600 dark:text-rose-400"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-topic`}
              className="block font-['Space_Grotesk'] text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold mb-1.5"
            >
              Topic of Discussion
            </label>
            <select
              id={`${formId}-topic`}
              name="topic"
              disabled={busy}
              value={topic}
              aria-invalid={Boolean(errors.topic)}
              aria-describedby={
                errors.topic ? `${formId}-topic-error` : undefined
              }
              onChange={(event) => {
                setTopic(event.target.value);
                clearError("topic");
              }}
              className={cn(fieldClass(Boolean(errors.topic)), "cursor-pointer")}
            >
              {TOPICS.map((value) => (
                <option key={value} value={value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {value}
                </option>
              ))}
            </select>
            {errors.topic ? (
              <p
                id={`${formId}-topic-error`}
                role="alert"
                className="mt-1.5 font-['Hanken_Grotesk'] text-xs text-rose-600 dark:text-rose-400"
              >
                {errors.topic}
              </p>
            ) : null}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <label
                htmlFor={`${formId}-message`}
                className="block font-['Space_Grotesk'] text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold"
              >
                Message / Inquiry Scope
              </label>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {message.length}/{messageLimit}
              </span>
            </div>
            <textarea
              id={`${formId}-message`}
              name="message"
              rows={4}
              disabled={busy}
              value={message}
              maxLength={messageLimit}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message
                  ? `${formId}-message-error`
                  : `${formId}-message-count`
              }
              onChange={(event) => {
                setMessage(event.target.value);
                clearError("message");
              }}
              className={cn(fieldClass(Boolean(errors.message)), "resize-none")}
              placeholder="Outline technical objectives, timeline constraints, tech stack requirements, and scope..."
            />
            <span id={`${formId}-message-count`} className="sr-only">
              {message.length} of {messageLimit} characters used
            </span>
            {errors.message ? (
              <p
                id={`${formId}-message-error`}
                role="alert"
                className="mt-1.5 font-['Hanken_Grotesk'] text-xs text-rose-600 dark:text-rose-400"
              >
                {errors.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border-l-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-2.5 font-['Hanken_Grotesk'] text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
              <span>{submitError}</span>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="font-['Hanken_Grotesk'] text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Dispatch goes directly to {siteName}
            </span>
            <button
              type="submit"
              disabled={busy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-['Space_Grotesk'] text-sm font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin text-emerald-400 dark:text-emerald-600" aria-hidden />
              ) : (
                <Send size={16} aria-hidden />
              )}
              <span className={busy ? "font-mono text-xs tracking-wider" : ""}>
                {transmissionPhase ?? (busy ? "SENDING…" : success ? "TRANSMITTED" : submitLabel)}
              </span>
              {!busy ? <ChevronRight size={15} aria-hidden /> : null}
            </button>
          </div>
        </form>
      </div>
    );
  },
);

ContactForm.displayName = "ContactForm";