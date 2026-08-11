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
      pathname === "/dashboard/ai/talk",
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
    href: "/dashboard",
    icon: "人",
    matches: (pathname) =>
    pathname === "/dashboard",
  },
];

function shouldShowNavigation(
  pathname: string,
): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/maintenance"
  ) {
    return false;
  }

  if (
    pathname.startsWith("/admin")
  ) {
    return false;
  }

  return (
    pathname === "/app-home" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/hsk")
  );
}

export default function PwaBottomNav() {
  const pathname =
    usePathname();

  if (
    !shouldShowNavigation(
      pathname,
    )
  ) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="
          h-[84px]
          md:hidden
        "
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
          pb-[max(9px,env(safe-area-inset-bottom))]
          pt-2
          backdrop-blur-xl
          md:hidden
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-lg
            grid-cols-5
            px-2
          "
        >
          {NAV_ITEMS.map(
            (item) => {
              const active =
                item.matches(
                  pathname,
                );

              return (
                <Link
                  key={
                    item.label
                  }
                  href={
                    item.href
                  }
                  className="
                    flex
                    min-h-[58px]
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-xl
                    px-1
                    text-center
                    transition
                    active:scale-95
                  "
                >
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-lg text-[18px] font-black transition",

                      active
                        ? "bg-fuchsia-500/15 text-fuchsia-400"
                        : "text-[#796b82]",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      item.icon
                    }
                  </span>

                  <span
                    className={[
                      "text-[10px] font-semibold transition",

                      active
                        ? "text-fuchsia-400"
                        : "text-[#796b82]",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      item.label
                    }
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </nav>
    </>
  );
}