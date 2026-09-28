import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <Logo />
      <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-stone-900">404</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        This page wandered off the mission board. Let&apos;s get you back to safety.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
