"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getUserHskAccess,
  hasHskLevelAccess,
} from "@/lib/hsk-access";

import type {
  UserHskAccess,
} from "@/types/access";


const LEVELS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
] as const;


export default function HskPage() {
  const [rows, setRows] =
    useState<UserHskAccess[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    let active = true;

    getUserHskAccess()
      .then((data) => {
        if (active) {
          setRows(data);
        }
      })
      .catch((error) => {
        console.error(
          "Unable to load HSK access:",
          error,
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);


  return (
    <main
      className="
        min-h-screen
        bg-[#09030f]
        px-5
        pb-28
        pt-6
        text-white
      "
    >
      <section
        className="
          mx-auto
          w-full
          max-w-lg
        "
      >
        {/* Header */}
        <header
          className="
            flex
            items-center
            gap-[14px]
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-[18px]
              bg-[#281237]
              text-[26px]
              text-fuchsia-300
            "
          >
            ▣
          </div>

          <div className="flex-1">
            <p
              className="
                text-[11px]
                font-extrabold
                tracking-[0.15em]
                text-purple-300
              "
            >
              HSK 3.0
            </p>

            <h1
              className="
                mt-[3px]
                text-[27px]
                font-extrabold
                leading-tight
              "
            >
              HSK Learning
            </h1>
          </div>

          <Link
            href="/hsk/store"
            className="
              rounded-xl
              border
              border-fuchsia-400/20
              bg-fuchsia-500/10
              px-3
              py-2
              text-[10px]
              font-black
              text-fuchsia-200
            "
          >
            STORE
          </Link>
        </header>


        {/* Description */}
        <p
          lang="my"
          className="
            mt-5
            text-[14px]
            leading-[22px]
            text-[#9c8ca6]
          "
        >
          Hanzi, Pinyin, Myanmar နဲ့
          English meanings ပါတဲ့ HSK
          vocabulary တွေကို Flashcards
          နဲ့ Writing နှစ်မျိုးလုံး
          လေ့ကျင့်နိုင်ပါတယ်။
        </p>


        {/* Free Banner */}
        <div
          className="
            mb-[22px]
            mt-[19px]
            flex
            items-center
            gap-[11px]
            rounded-[18px]
            border
            border-green-500/20
            bg-green-500/[0.07]
            p-[15px]
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-green-500/10
              text-xl
            "
          >
            🎁
          </div>

          <div className="flex-1">
            <p
              className="
                text-[13px]
                font-extrabold
                text-green-200
              "
            >
              HSK 1 is Free
            </p>

            <p
              lang="my"
              className="
                mt-[3px]
                text-[11px]
                leading-[17px]
                text-[#7fa48c]
              "
            >
              HSK 2–9 ကို website မှာ
              ဝယ်ထားတဲ့ account နဲ့
              အလိုအလျောက် sync
              ဖြစ်ပါတယ်။
            </p>
          </div>
        </div>


        {/* Loading */}
        {loading ? (
          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  h-9
                  w-9
                  animate-spin
                  rounded-full
                  border-4
                  border-white/10
                  border-t-fuchsia-400
                "
              />

              <p
                className="
                  mt-3
                  text-xs
                  text-white/40
                "
              >
                Checking your HSK access...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Level Grid */}
            <div
              className="
                grid
                grid-cols-3
                gap-3
              "
            >
              {LEVELS.map((level) => {
                const unlocked =
                  hasHskLevelAccess(
                    level,
                    rows,
                  );

                return (
                  <Link
                    key={level}
                    href={
                      unlocked
                        ? `/hsk/flashcards/${level}`
                        : "/hsk/store"
                    }
                    className="
                      min-h-[158px]
                      rounded-[19px]
                      border
                      border-[#33203d]
                      bg-[#160b20]
                      p-[13px]
                      transition
                      active:scale-[0.97]
                      active:opacity-75
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-extrabold
                          tracking-[0.14em]
                          text-[#8e7b99]
                        "
                      >
                        HSK
                      </p>

                      {level === 1 ? (
                        <span
                          className="
                            rounded-lg
                            bg-green-500/10
                            px-[5px]
                            py-[3px]
                            text-[7px]
                            font-black
                            text-green-300
                          "
                        >
                          FREE
                        </span>
                      ) : unlocked ? (
                        <span
                          className="
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-green-500/10
                            text-[10px]
                            text-green-300
                          "
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          className="
                            text-[13px]
                            text-[#75677f]
                          "
                        >
                          🔒
                        </span>
                      )}
                    </div>


                    <p
                      className="
                        mt-[10px]
                        text-[38px]
                        font-black
                        leading-none
                        text-fuchsia-300
                      "
                    >
                      {level}
                    </p>


                    <p
                      className="
                        mt-2
                        text-[11px]
                        font-bold
                        text-white
                      "
                    >
                      {unlocked
                        ? "Flashcards"
                        : "Locked"}
                    </p>


                    <div
                      className="
                        mt-[10px]
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-bold
                          text-purple-300
                        "
                      >
                        {unlocked
                          ? "Open"
                          : "Unlock"}
                      </span>

                      <span
                        className="
                          text-[14px]
                          text-purple-300
                        "
                      >
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>


            {/* Writing Section */}
            <div
              className="
                mt-7
                rounded-[22px]
                border
                border-[#33203d]
                bg-[#130a1b]
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-[#281237]
                    text-xl
                  "
                >
                  ✍️
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-black
                      tracking-[0.15em]
                      text-fuchsia-300
                    "
                  >
                    CHINESE CHARACTERS
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-extrabold
                    "
                  >
                    HSK Writing
                  </h2>
                </div>
              </div>

              <p
                lang="my"
                className="
                  mt-4
                  text-[12px]
                  leading-5
                  text-[#8e7e98]
                "
              >
                Stroke order ကိုကြည့်ပြီး
                Chinese characters တွေကို
                တစ်ဆင့်ချင်း လေ့ကျင့်ပါ။
              </p>

              <Link
                href="/hsk/writing"
                className="
                  mt-4
                  flex
                  h-12
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-fuchsia-400/20
                  bg-fuchsia-500/10
                  text-[12px]
                  font-black
                  text-fuchsia-200
                "
              >
                Open Writing Practice →
              </Link>
            </div>


            {/* Store */}
            <Link
              href="/hsk/store"
              className="
                mt-3
                flex
                min-h-[80px]
                items-center
                gap-3
                rounded-[18px]
                border
                border-[#183942]
                bg-[#0c171e]
                px-[14px]
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-[#10303a]
                  text-lg
                "
              >
                ◆
              </div>

              <div className="flex-1">
                <p
                  className="
                    text-[8px]
                    font-black
                    tracking-[0.12em]
                    text-cyan-300
                  "
                >
                  HSK ACCESS
                </p>

                <p
                  className="
                    mt-1
                    text-[13px]
                    font-extrabold
                  "
                >
                  Unlock HSK 2–9
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-[#849ca2]
                  "
                >
                  Individual levels or Full Package
                </p>
              </div>

              <span
                className="
                  text-xl
                  text-[#70868c]
                "
              >
                ›
              </span>
            </Link>
          </>
        )}
      </section>
    </main>
  );
}