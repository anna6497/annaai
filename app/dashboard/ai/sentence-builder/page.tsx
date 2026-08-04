import { redirect } from "next/navigation";

export default function SentenceBuilderRedirectPage() {
  redirect("/dashboard/ai/talk");
}