"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  matches: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/app-home",
    icon: "⌂",
    matches: (pathname) =>
      pathname === "/app-home",
  },

  {
    label: "Library",
    href: "/library",
    icon: "📚",
    matches: (pathname) =>
      pathname === "/library" ||
      pathname.startsWith("/library/"),
  },

  {
    label: "HSK",
    href: "/hsk",
    icon: "▣",
    matches: (pathname) =>
      pathname.startsWith("/hsk"),
  },

  {
    label: "Speaking",
    href: "/dashboard/ai/talk",
    icon: "●",
    matches: (pathname) =>
      pathname === "/dashboard/ai/talk" ||
      pathname.startsWith(
        "/dashboard/ai/sentence-builder",
      ),
  },

  {
    label: "Laoshi",
    href: "/dashboard/ai/laoshi",
    icon: "学",
    matches: (pathname) =>
      pathname.startsWith(
        "/dashboard/ai/laoshi",
      ) ||
      pathname.startsWith(
        "/dashboard/ai/pronunciation",
      ) ||
      pathname.startsWith(
        "/dashboard/ai/lessons",
      ) ||
      pathname.startsWith(
        "/dashboard/ai/grammar",
      ),
  },

  {
    label: "Account",
    href: "/app-account",
    icon: "人",
    matches: (pathname) =>
      pathname === "/app-account" ||
      pathname.startsWith(
        "/dashboard/payments",
      ),
  },
];

function shouldShowNavigation(
  pathname: string,
): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/maintenance" ||
    pathname.startsWith("/admin")
  ) {
    return false;
  }

  return (
    pathname === "/app-home" ||
    pathname === "/app-account" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/hsk") ||
    pathname.startsWith("/library")
  );
}

export default function PwaBottomNav() {
  const pathname = usePathname();

  if (!shouldShowNavigation(pathname)) {
    return null;
  }

  return (
    <>
      {/* Prevent page content from hiding behind bottom navigation */}
      <div
        aria-hidden="true"
        className="h-[92px]"
      />

      <nav
        aria-label="Anna AI navigation"
        className="
          fixed
          inset-x-0
          bottom-0
          z-[90]
          border-t
          border-[#2b1838]
          bg-[#12091c]/95
          pt-2
          backdrop-blur-xl
          pb-[max(10px,env(safe-area-inset-bottom))]
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-lg
            grid-cols-6
            px-1
          "
        >
          {NAV_ITEMS.map((item) => {
            const active =
              item.matches(pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                className="
                  flex
                  min-h-[58px]
                  min-w-0
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  rounded-xl
                  px-0.5
                  text-center
                  transition
                  active:scale-95
                "
              >
                <span
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-lg text-[17px] font-black transition",
                    active
                      ? "bg-fuchsia-500/15 text-fuchsia-400"
                      : "text-[#796b82]",
                  ].join(" ")}
                >
                  {item.icon}
                </span>

                <span
                  className={[
                    "w-full truncate text-[9px] font-semibold transition",
                    active
                      ? "text-fuchsia-400"
                      : "text-[#796b82]",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}