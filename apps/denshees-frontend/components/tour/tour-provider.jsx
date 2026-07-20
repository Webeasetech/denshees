"use client";

import { useJoyride, STATUS } from "react-joyride";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/auth.store";
import AppPasswordModal from "./app-password-modal";

const TourContext = createContext({ isTourActive: false });
export const useTour = () => useContext(TourContext);

// Resolves once the selector exists in the DOM — lets `before` hooks block a
// step until its target has mounted instead of guessing with timeouts.
const waitForElement = (selector, timeout = 5000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - start > timeout)
        return reject(new Error(`Timed out waiting for ${selector}`));
      requestAnimationFrame(check);
    };
    check();
  });

// Opens the create-campaign dialog if it isn't already, waiting until its
// fields are mounted. Used by the dialog steps so the tour self-heals even if
// the dialog was never opened (or got closed) before the step renders.
const ensureCreateDialogOpen = async () => {
  if (document.getElementById("title")) return;
  document.getElementById("tour-new-campaign-btn")?.click();
  await waitForElement("#title");
};

const STEPS = [
  {
    target: "#tour-new-campaign-btn",
    title: "Create Your First Campaign",
    content:
      "Let's walk through creating your first email outreach campaign! Click Next to get started.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: "#title",
    title: "Campaign Title",
    content:
      'Give your campaign a clear name — something that reflects who you\'re targeting (e.g. "Q2 SaaS Outreach").',
    skipBeacon: true,
    placement: "bottom",
    before: ensureCreateDialogOpen,
  },
  {
    target: "#desc",
    title: "Campaign Description",
    content:
      "Describe your campaign's objective. Who are you reaching out to? What's the offer? This is for your reference only.",
    skipBeacon: true,
    placement: "top",
    before: ensureCreateDialogOpen,
  },
  {
    target: "#tour-create-campaign-submit",
    title: "Create It!",
    content:
      "Click Next to create your campaign. It starts with a ready-made sequence you can shape in the Builder afterwards.",
    skipBeacon: true,
    placement: "top",
    before: ensureCreateDialogOpen,
  },
  {
    target: "#tour-tab-leads",
    title: "Leads Tab",
    content:
      "This is your lead list. Import contacts via CSV or add them individually. The campaign emails each lead through your sequence automatically.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: "#tour-tab-crm",
    title: "CRM Board",
    content:
      "Track deal progress on a Kanban board. Move leads through custom stages as they respond — from First Contact to Closed.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: "#tour-tab-builder",
    title: "Pitch Builder",
    content:
      "Write your email templates here. Use spintax like {Hello|Hi|Hey} to make every email unique — better deliverability, fewer spam flags.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: "#tour-tab-analytics",
    title: "Analytics Dashboard",
    content:
      "Monitor opens, clicks, replies, and bounces in real time. Use this to fine-tune your timing and messaging over time.",
    skipBeacon: true,
    placement: "bottom",
  },
];

// Steps that need special handling, located by target so the flow logic
// survives steps being added or removed.
const stepIndexOf = (target) => STEPS.findIndex((s) => s.target === target);
const TITLE_STEP = stepIndexOf("#title");
const DESC_STEP = stepIndexOf("#desc");
const CREATE_STEP = stepIndexOf("#tour-create-campaign-submit");

// Color tokens + behavior flags — passed as `options` prop in v3
const joyrideOptions = {
  arrowColor: "#ffffff",
  backgroundColor: "#ffffff",
  overlayColor: "rgba(0, 0, 0, 0.55)",
  primaryColor: "#000000",
  textColor: "#111827",
  zIndex: 10000,
  // No back button
  buttons: ["close", "primary"],
  // Prevent overlay clicks from closing the tour — fixes Radix portal
  // dropdowns (Select, Combobox, etc.) that render outside the spotlight
  overlayClickAction: false,
};

// CSS overrides — passed as `styles` prop in v3
const joyrideStyles = {
  tooltip: {
    borderRadius: 0,
    border: "2px solid #000000",
    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    padding: "20px",
  },
  tooltipTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  tooltipContent: {
    fontSize: "14px",
    lineHeight: "1.6",
    padding: "0",
  },
  buttonPrimary: {
    backgroundColor: "#000000",
    borderRadius: 0,
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    padding: "8px 16px",
  },
  buttonBack: {
    backgroundColor: "transparent",
    border: "1px solid #000000",
    borderRadius: 0,
    color: "#000000",
    fontSize: "13px",
    fontWeight: "600",
    padding: "8px 16px",
    marginRight: "8px",
  },
  buttonSkip: {
    color: "#6b7280",
    fontSize: "13px",
  },
  spotlight: {
    borderRadius: 0,
    border: "2px solid #000000",
  },
  buttonClose: {
    color: "#111827",
  },
};

export function TourProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, updateUser } = useAuthStore();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const prevPathnameRef = useRef(pathname);
  // Ref keeps the latest stepIndex readable inside effects without stale closures
  const stepIndexRef = useRef(0);
  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  // Start the tour once for users who haven't finished it (DB-backed flag).
  // `startedRef` is set when the timer fires — not when scheduled — so React
  // StrictMode's mount→cleanup→mount (which clears the pending timer) still
  // reschedules instead of latching the guard and killing the tour.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current || !user || user.tourCompleted) return;
    const t = setTimeout(() => {
      startedRef.current = true;
      router.push("/campaigns");
      setTimeout(() => setRun(true), 800);
    }, 1200);
    return () => clearTimeout(t);
  }, [user, router]);

  // Detect navigation from the campaigns list → /campaigns/[id] after the
  // create dialog submits
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    const isNowOnCampaignDetail = /^\/campaigns\/[^/]+$/.test(pathname);
    const wasOnCampaignsList = prev === "/campaigns";

    if (
      isNowOnCampaignDetail &&
      wasOnCampaignsList &&
      stepIndexRef.current === CREATE_STEP
    ) {
      setTimeout(() => {
        setStepIndex(CREATE_STEP + 1);
        setRun(true);
      }, 800);
    }
  }, [pathname]);

  const completeTour = useCallback(() => {
    setRun(false);
    setShowModal(true);
    // Persist so the tour never shows again — completed, skipped, or closed.
    updateUser({ tourCompleted: true });
    if (token) {
      fetch("/api/auth/complete-tour", {
        method: "POST",
        headers: { Authorization: token },
      }).catch((err) =>
        console.error("Failed to persist tour completion:", err),
      );
    }
  }, [token, updateUser]);

  const handleEvent = useCallback(
    (data, controls) => {
      const { action, index, status, type } = data;

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        completeTour();
        return;
      }

      if (type !== "step:after") return;

      if (action === "close") {
        completeTour();
        return;
      }

      if (action === "prev") return;

      // Moving forward — validate required fields before advancing
      switch (index) {
        case 0:
          // TITLE_STEP's before hook opens the create dialog and waits for it
          setStepIndex(TITLE_STEP);
          break;

        case TITLE_STEP: {
          // title — must not be empty
          const title = document.getElementById("title")?.value?.trim();
          if (!title) {
            toast.error("Please enter a campaign title before continuing.");
            controls.open();
            return;
          }
          setStepIndex(DESC_STEP);
          break;
        }

        case DESC_STEP: {
          // desc — must not be empty
          const desc = document.getElementById("desc")?.value?.trim();
          if (!desc) {
            toast.error("Please enter a campaign description before continuing.");
            controls.open();
            return;
          }
          setStepIndex(CREATE_STEP);
          break;
        }

        case CREATE_STEP:
          // submit → dialog creates the campaign and navigates to its page;
          // the navigation effect advances the tour there
          setRun(false);
          document.getElementById("tour-create-campaign-submit")?.click();
          break;

        case STEPS.length - 1:
          completeTour();
          break;

        default:
          setStepIndex(index + 1);
      }
    },
    [completeTour],
  );

  const { Tour } = useJoyride({
    continuous: true,
    run,
    stepIndex,
    steps: STEPS,
    showProgress: true,
    showSkipButton: true,
    scrollToFirstStep: true,
    options: joyrideOptions,
    styles: joyrideStyles,
    locale: {
      back: "Back",
      close: "Close",
      last: "Finish",
      next: "Next →",
      skip: "Skip tour",
    },
    onEvent: handleEvent,
  });

  return (
    <TourContext.Provider value={{ isTourActive: run }}>
      {Tour}
      {children}
      <AppPasswordModal open={showModal} onClose={() => setShowModal(false)} />
    </TourContext.Provider>
  );
}
