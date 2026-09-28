import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * OfflineOverlay — full-screen offline "empty state" island.
 *
 * Shows itself whenever the browser reports no internet connection and runs a
 * heartbeat probe (tiny fetch against a cache-busted same-origin URL) so it
 * also catches flaky/portal networks where `navigator.onLine` stays true even
 * though no traffic passes. Wired to re-check when connectivity events fire,
 * when the tab becomes visible again, and on a periodic timer.
 */

const HEARTBEAT_URL = "/favicon.svg";
const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TIMEOUT_MS = 6_000;

type Connectivity = "online" | "offline" | "checking";

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => window.clearTimeout(timer) };
}

async function probeNetwork(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }
  const { signal, done } = withTimeout(HEARTBEAT_TIMEOUT_MS);
  try {
    // `no-store` forces a real network round-trip instead of serving the
    // HTTP cache — that is what makes this a connectivity probe.
    await fetch(`${HEARTBEAT_URL}?heartbeat=${Date.now()}`, {
      cache: "no-store",
      signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    done();
  }
}

export default function OfflineOverlay() {
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<Connectivity>("checking");
  const [isRetrying, setIsRetrying] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const recheck = useCallback(async (interactive: boolean) => {
    if (interactive) setIsRetrying(true);
    const reachable = await probeNetwork();
    if (!mountedRef.current) return;
    setStatus(reachable ? "online" : "offline");
    if (interactive) setIsRetrying(false);
  }, []);

  useEffect(() => {
    let heartbeat: number | undefined;

    const onOnline = () => recheck(false);
    const onOffline = () => setStatus("offline");
    const onVisible = () => {
      if (document.visibilityState === "visible") recheck(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    // Initial probe: confirm the connection is real before showing anything.
    recheck(false);
    heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") recheck(false);
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      if (heartbeat) window.clearInterval(heartbeat);
    };
  }, [recheck]);

  const offline = status === "offline";

  const handleRetry = () => {
    setStatus("checking");
    void recheck(true);
  };

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          key="offline-overlay"
          aria-live="assertive"
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f8f9ff]/95 backdrop-blur-md dark:bg-[#050811]/95"
        >
          {/* Soft animated ambient glow behind the card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/5 blur-3xl dark:bg-white/5"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md"
          >
            <Empty className="bg-white/80 shadow-[0_24px_60px_-12px_rgba(10,17,40,0.25)] ring-1 ring-slate-900/5 backdrop-blur-xl dark:bg-slate-950/80 dark:ring-white/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  {/* Blinking radar rings around the offline icon */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-lg"
                  >
                    {[0, 1].map((i) => (
                      <motion.span
                        key={i}
                        className="absolute inset-0 rounded-lg border-2 border-slate-400 dark:border-slate-500"
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { scale: [1, 2.1], opacity: [0.55, 0] }
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: i * 1,
                        }}
                      />
                    ))}
                  </span>
                  {/* Wifi icon with animated slash — fades in after mount */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 text-slate-700 dark:text-slate-200"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="2" x2="22" y2="22" className="origin-center motion-safe:animate-[wifi-off-slash_2.4s_ease-in-out_infinite]" />
                    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                    <path d="M5 12.55a11 11 0 0 1 5.17-2.39" />
                    <path d="M10.31 12.06a5.94 5.94 0 0 1 4.05.28M19 12.55a11 11 0 0 0-2.14-1.68" />
                    <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
                    <path d="M22 8.82a15 15 0 0 0-4.17-2.65" />
                    <path d="M12 20h.01" />
                  </svg>
                </EmptyMedia>
                <EmptyTitle>No Internet Connection</EmptyTitle>
                <EmptyDescription>
                  It seems you are offline. Check your internet connection and
                  try again.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button size="sm" onClick={handleRetry} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <motion.span
                        className="block size-3.5 rounded-full border-2 border-white/40 border-t-white dark:border-slate-500/40 dark:border-t-white"
                        animate={
                          prefersReducedMotion ? undefined : { rotate: 360 }
                        }
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Checking…
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </EmptyContent>
            </Empty>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
