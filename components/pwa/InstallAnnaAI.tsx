"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

declare global {
  interface Window {
    deferredAnnaInstallPrompt?: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

const ANNA_APP_LOGO =
  "/images/anna-ai-logo.jpg";

function isIos() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    /iPad|iPhone|iPod/.test(
      navigator.userAgent,
    ) ||
    (navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    Boolean(navigator.standalone)
  );
}

export default function InstallAnnaAI() {
  const [
    promptEvent,
    setPromptEvent,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null,
    );

  const [
    showIosGuide,
    setShowIosGuide,
  ] =
    useState(false);

  const [
    installed,
    setInstalled,
  ] =
    useState(false);

  useEffect(() => {
    setInstalled(
      isStandalone(),
    );

    if (
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error(
            "PWA service worker registration failed:",
            error,
          );
        });
    }

    const handleBeforeInstall = (
      event: Event,
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      setPromptEvent(
        installEvent,
      );

      window.deferredAnnaInstallPrompt =
        installEvent;
    };

    const handleInstalled =
      () => {
        setInstalled(true);
        setPromptEvent(null);

        window.deferredAnnaInstallPrompt =
          undefined;
      };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall,
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall,
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled,
      );
    };
  }, []);

  async function install() {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (isIos()) {
      setShowIosGuide(true);
      return;
    }

    if (promptEvent) {
      await promptEvent.prompt();

      const result =
        await promptEvent.userChoice;

      if (
        result.outcome ===
        "accepted"
      ) {
        setInstalled(true);
      }

      setPromptEvent(null);

      return;
    }

    alert(
      "Browser menu ကိုဖွင့်ပြီး Install app သို့မဟုတ် Add to Home Screen ကိုရွေးပါ။",
    );
  }

  if (installed) {
    return null;
  }

  return (
    <>
      {/* Install button */}
      <button
        type="button"
        onClick={install}
        className="
          fixed
          bottom-24
          right-4
          z-[100]

          flex
          items-center
          gap-3

          rounded-2xl
          border
          border-fuchsia-400/30

          bg-[#180823]/95
          px-4
          py-3

          shadow-2xl
          backdrop-blur-xl

          md:bottom-24
          md:right-5
        "
      >
        <img
          src={ANNA_APP_LOGO}
          alt="Anna AI"
          className="
            h-12
            w-12
            rounded-xl
            object-cover
            shadow-lg
          "
        />

        <span className="text-left">
          <span
            className="
              block
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-fuchsia-300
            "
          >
            Install App
          </span>

          <span
            className="
              block
              text-sm
              font-black
              text-white
            "
          >
            Install Anna AI
          </span>
        </span>
      </button>

      {/* iPhone install guide */}
      {showIosGuide ? (
        <div
          className="
            fixed
            inset-0
            z-[200]

            flex
            items-end
            justify-center

            bg-black/70
            p-4
            backdrop-blur-sm

            sm:items-center
          "
          onClick={() =>
            setShowIosGuide(false)
          }
        >
          <div
            className="
              w-full
              max-w-md

              rounded-[28px]
              border
              border-white/10

              bg-[#15091d]
              p-6
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <img
                src={ANNA_APP_LOGO}
                alt="Anna AI"
                className="
                  h-16
                  w-16
                  rounded-2xl
                  object-cover
                  shadow-lg
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-fuchsia-300
                  "
                >
                  Anna AI
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-white
                  "
                >
                  Install on iPhone
                </h2>
              </div>
            </div>

            <div
              className="
                mt-6
                space-y-4
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-white/[0.04]
                  p-4
                "
              >
                <p
                  className="
                    font-bold
                    text-white
                  "
                >
                  1. Share ကိုနှိပ်ပါ
                </p>

                <p
                  lang="my"
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-white/55
                  "
                >
                  Safari အောက်ဘက်က
                  Share icon (□ + ↑)
                  ကိုနှိပ်ပါ။
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-white/[0.04]
                  p-4
                "
              >
                <p
                  className="
                    font-bold
                    text-white
                  "
                >
                  2. Add to Home Screen
                </p>

                <p
                  lang="my"
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-white/55
                  "
                >
                  Share menu ထဲက
                  “Add to Home Screen”
                  ကိုရွေးပါ။
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-white/[0.04]
                  p-4
                "
              >
                <p
                  className="
                    font-bold
                    text-white
                  "
                >
                  3. Add
                </p>

                <p
                  lang="my"
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-white/55
                  "
                >
                  Anna AI logo နဲ့
                  Anna AI နာမည်
                  ပေါ်လာရင် Add
                  ကိုနှိပ်ပါ။
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowIosGuide(false)
              }
              className="
                mt-5
                h-12
                w-full

                rounded-2xl
                bg-fuchsia-600

                font-black
                text-white
              "
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}