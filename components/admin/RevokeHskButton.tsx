"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RevokeHskButtonProps = {
  userId: string;
  userEmail?: string | null;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function RevokeHskButton({
  userId,
  userEmail,
}: RevokeHskButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleRevoke() {
    const userLabel = userEmail || userId;

    const confirmed = window.confirm(
      `Revoke HSK Full Package access from ${userLabel}?`
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/admin/hsk-access/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}.`
        );
      }

      setMessage(data.message || "Access revoked successfully.");
      setIsError(false);

      router.refresh();
    } catch (error) {
      console.error("Revoke button error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to revoke HSK Full Package."
      );

      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleRevoke}
        disabled={isLoading}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Revoking..." : "Revoke"}
      </button>

      {message ? (
        <p
          className={`max-w-xs text-xs ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}