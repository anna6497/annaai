"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import { changeUserPassword } from "./actions";
import { initialChangePasswordState } from "./action-state";

interface ChangePasswordFormProps {
  userId: string;
  userEmail?: string;
}

export default function ChangePasswordForm({
  userId,
  userEmail,
}: ChangePasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    changeUserPassword,
    initialChangePasswordState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-xl border p-5"
    >
      <input
        type="hidden"
        name="userId"
        value={userId}
      />

      <div>
        <p className="text-sm text-gray-500">
          Password ပြောင်းမည့် User
        </p>

        <p className="font-medium">
          {userEmail || userId}
        </p>
      </div>

      <div>
        <label
          htmlFor={`new-password-${userId}`}
          className="mb-1 block text-sm font-medium"
        >
          New password
        </label>

        <input
          id={`new-password-${userId}`}
          name="newPassword"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="အနည်းဆုံး 8 လုံး"
        />
      </div>

      <div>
        <label
          htmlFor={`confirm-password-${userId}`}
          className="mb-1 block text-sm font-medium"
        >
          Confirm password
        </label>

        <input
          id={`confirm-password-${userId}`}
          name="confirmPassword"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password ကို ထပ်ရေးပါ"
        />
      </div>

      {state.message ? (
        <p
          className={
            state.success
              ? "text-sm text-green-600"
              : "text-sm text-red-600"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "ပြောင်းနေပါသည်..."
          : "Change Password"}
      </button>
    </form>
  );
}