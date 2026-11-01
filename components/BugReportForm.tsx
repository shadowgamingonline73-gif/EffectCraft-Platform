"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  ChevronDown,
  FileText,
  HelpCircle,
  ListOrdered,
  Loader2,
  Monitor,
  Send,
  Sliders,
  Sparkles,
} from "lucide-react";

import rawCatalog from "@/catalog.json";

interface CatalogPlugin {
  id: string;
  name: string;
  category: string;
}

type FormField = "plugin" | "software" | "description" | "steps" | "email";
type FormErrors = Partial<Record<FormField, string>>;

const catalog = rawCatalog as CatalogPlugin[];

const PLATFORM_OPTIONS = [
  { id: "platform-general", name: "General platform / account" },
  { id: "wasm-engine", name: "WASM core engine / WebGL canvas" },
  { id: "ofx-bridge", name: "OpenFX / Premiere / Resolve bridge" },
  { id: "audio-sfx", name: "SFX & audio pipeline" },
];

function fieldClass(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-slate-100",
    "placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2",
    hasError
      ? "border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/20"
      : "border-white/10 hover:border-white/20 focus:border-violet-400/70 focus:ring-violet-500/25",
  ].join(" ");
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <motion.p
      id={id}
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-1.5 text-xs text-rose-300"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </motion.p>
  );
}

export function BugReportForm() {
  const [plugin, setPlugin] = useState("");
  const [software, setSoftware] = useState("");
  const [os, setOs] = useState("Windows 11 (64-bit)");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [email, setEmail] = useState("");
  const [logs, setLogs] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  function clearError(field: FormField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!plugin) {
      next.plugin = "Choose the plugin or platform area affected.";
    }

    if (!software.trim()) {
      next.software = "Tell us which editor and version you are using.";
    }

    if (!description.trim()) {
      next.description = "Describe what happened and what you expected.";
    } else if (description.trim().length < 30) {
      next.description =
        "Add a little more detail — at least 30 characters helps us diagnose.";
    }

    if (!steps.trim()) {
      next.steps = "List the steps that reproduce the issue.";
    } else if (steps.trim().length < 10) {
      next.steps = "Add at least one clear, repeatable step.";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address for ticket updates.";
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0] as FormField;
      window.requestAnimationFrame(() => {
        document.getElementById(`bug-${firstField}`)?.focus();
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Mock submission — swap for your API/route handler when ready.
    await new Promise((resolve) => window.setTimeout(resolve, 1100));

    const generatedId = `EC-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    setTicketId(generatedId);
    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  function resetForm() {
    setPlugin("");
    setSoftware("");
    setOs("Windows 11 (64-bit)");
    setDescription("");
    setSteps("");
    setEmail("");
    setLogs("");
    setErrors({});
    setIsSubmitted(false);
    setTicketId("");
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mx-auto max-w-3xl rounded-3xl p-7 text-center sm:p-12"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-950/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="mt-6 space-y-2">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Ticket received · {ticketId}
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Report submitted
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-6 text-slate-400">
            Thanks for helping us tighten the pipeline. Our engineering team
            reviews every report and will follow up if we need more detail.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-md space-y-2 rounded-2xl border border-white/[0.07] bg-slate-950/60 p-4 text-left text-xs text-slate-400">
          <p>
            <span className="text-slate-300">Plugin:</span> {plugin}
          </p>
          <p>
            <span className="text-slate-300">Editor:</span> {software}
          </p>
          <p>
            <span className="text-slate-300">Platform:</span> {os}
          </p>
          {email && (
            <p>
              <span className="text-slate-300">Follow-up:</span> {email}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-cyan-400 active:scale-95"
          >
            Submit another report
          </button>
          <Link
            href="/plugins"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Back to plugins
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="glass-panel relative mx-auto max-w-3xl space-y-7 rounded-3xl p-6 sm:p-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-violet-300">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Submit a bug report
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
              Reproducible details help our graphics engineers fix things
              faster.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-violet-200">
          <Sparkles className="h-3 w-3 text-cyan-300" />
          Priority queue
        </span>
      </div>

      {/* Plugin + software */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="bug-plugin"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <Sliders className="h-4 w-4 text-violet-300" />
            Select plugin
            <span className="text-violet-300">*</span>
          </label>

          <div className="relative">
            <select
              id="bug-plugin"
              value={plugin}
              onChange={(event) => {
                setPlugin(event.target.value);
                clearError("plugin");
              }}
              aria-invalid={Boolean(errors.plugin)}
              aria-describedby={
                errors.plugin ? "bug-plugin-error" : undefined
              }
              className={`${fieldClass(Boolean(errors.plugin))} appearance-none pr-10`}
            >
              <option value="" disabled>
                Choose a plugin or component
              </option>
              <optgroup label="Platform & engines">
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Plugin catalog">
                {catalog.map((item) => (
                  <option
                    key={item.id}
                    value={`${item.name} — ${item.category}`}
                  >
                    {item.name} — {item.category}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          <FieldError id="bug-plugin-error" message={errors.plugin} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="bug-software"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <Monitor className="h-4 w-4 text-cyan-300" />
            Editing software &amp; version
            <span className="text-violet-300">*</span>
          </label>

          <input
            id="bug-software"
            type="text"
            list="software-suggestions"
            value={software}
            onChange={(event) => {
              setSoftware(event.target.value);
              clearError("software");
            }}
            placeholder="e.g. DaVinci Resolve Studio 19.1"
            aria-invalid={Boolean(errors.software)}
            aria-describedby={
              errors.software ? "bug-software-error" : undefined
            }
            className={fieldClass(Boolean(errors.software))}
          />
          <datalist id="software-suggestions">
            <option value="DaVinci Resolve Studio 19.1" />
            <option value="DaVinci Resolve 19.0" />
            <option value="Adobe Premiere Pro 2025 (v25.1)" />
            <option value="Adobe After Effects 2025" />
            <option value="Final Cut Pro 11.0" />
            <option value="Effectcraft Web Studio" />
          </datalist>

          <FieldError id="bug-software-error" message={errors.software} />
        </div>
      </div>

      {/* OS + email */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="bug-os"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <Monitor className="h-4 w-4 text-slate-400" />
            Operating system
          </label>

          <div className="relative">
            <select
              id="bug-os"
              value={os}
              onChange={(event) => setOs(event.target.value)}
              className={`${fieldClass(false)} appearance-none pr-10`}
            >
              <option value="Windows 11 (64-bit)">Windows 11 (64-bit)</option>
              <option value="Windows 10 (64-bit)">Windows 10 (64-bit)</option>
              <option value="macOS 15 Sequoia (Apple Silicon)">
                macOS 15 Sequoia (Apple Silicon)
              </option>
              <option value="macOS 14 Sonoma (Apple Silicon)">
                macOS 14 Sonoma (Apple Silicon)
              </option>
              <option value="macOS (Intel x86_64)">macOS (Intel x86_64)</option>
              <option value="Linux Ubuntu / Debian (x86_64)">
                Linux Ubuntu / Debian
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="bug-email"
            className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <span>Email address</span>
            <span className="text-[11px] font-normal text-slate-500">
              Optional
            </span>
          </label>

          <input
            id="bug-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
            placeholder="creator@studio.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "bug-email-error" : undefined}
            className={fieldClass(Boolean(errors.email))}
          />

          <FieldError id="bug-email-error" message={errors.email} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label
            htmlFor="bug-description"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <FileText className="h-4 w-4 text-violet-300" />
            Bug description
            <span className="text-violet-300">*</span>
          </label>
          <span className="font-mono text-[10px] text-slate-500">
            {description.length}/2000
          </span>
        </div>

        <textarea
          id="bug-description"
          rows={5}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            clearError("description");
          }}
          maxLength={2000}
          placeholder="What happened, and what did you expect instead? Include the effect settings, clip format, and any error message you saw."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "bug-description-error" : undefined
          }
          className={`${fieldClass(Boolean(errors.description))} resize-y leading-6`}
        />

        <FieldError
          id="bug-description-error"
          message={errors.description}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label
            htmlFor="bug-steps"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:text-sm"
          >
            <ListOrdered className="h-4 w-4 text-cyan-300" />
            Steps to reproduce
            <span className="text-violet-300">*</span>
          </label>
          <span className="font-mono text-[10px] text-slate-500">
            {steps.length}/2000
          </span>
        </div>

        <textarea
          id="bug-steps"
          rows={6}
          value={steps}
          onChange={(event) => {
            setSteps(event.target.value);
            clearError("steps");
          }}
          maxLength={2000}
          placeholder={`1. Create a 4K 24fps timeline\n2. Add an adjustment clip and apply S_Glow\n3. Raise the threshold to 2.5\n4. Scrub the timeline or render the clip`}
          aria-invalid={Boolean(errors.steps)}
          aria-describedby={errors.steps ? "bug-steps-error" : undefined}
          className={`${fieldClass(Boolean(errors.steps))} resize-y font-mono text-xs leading-6`}
        />

        <FieldError id="bug-steps-error" message={errors.steps} />
      </div>

      {/* Logs */}
      <div className="space-y-2">
        <label
          htmlFor="bug-logs"
          className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-200 sm:text-sm"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            Console output or crash trace
          </span>
          <span className="text-[11px] font-normal text-slate-500">
            Optional
          </span>
        </label>

        <textarea
          id="bug-logs"
          rows={3}
          value={logs}
          onChange={(event) => setLogs(event.target.value)}
          placeholder="Paste a WebAssembly panic message, GPU driver error, or terminal log…"
          className={`${fieldClass(false)} resize-y font-mono text-xs leading-5`}
        />
      </div>

      {/* Submit */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-5 sm:flex-row">
        <p className="max-w-sm text-[11px] leading-5 text-slate-500">
          Reports are reviewed by the Effectcraft engineering team. Include a
          follow-up email if you want status updates.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transmitting report…
            </>
          ) : (
            <>
              Submit report
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default BugReportForm;
