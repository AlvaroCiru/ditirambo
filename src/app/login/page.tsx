import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import murnau from "../../../public/images/murnau-obermarkt.jpg";

export const metadata: Metadata = {
  title: "Ditirambo — Entrar",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-y-auto px-4 py-12 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(5rem,env(safe-area-inset-bottom))]">
      <Image
        src={murnau}
        alt="Murnau, casas en el Obermarkt — Wassily Kandinsky, 1908"
        placeholder="blur"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-center text-xs text-white/70 italic">
        Wassily Kandinsky — Murnau, casas en el Obermarkt (1908)
      </p>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192"
            alt=""
            width={64}
            height={64}
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h1 className="font-heading text-3xl italic tracking-tight text-white drop-shadow-sm">
              Ditirambo
            </h1>
            <p className="mt-1 text-sm text-white/80 drop-shadow-sm">
              Analfabetos en rehabilitación cultural.
            </p>
          </div>
        </div>
        <div className="w-full rounded-xl border border-white/15 bg-card/90 p-6 shadow-2xl backdrop-blur-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
