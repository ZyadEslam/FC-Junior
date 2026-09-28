import { Star, CheckCircle2, Heart, Gamepad2 } from "lucide-react";

/**
 * Hand-built CSS mock of the product for the landing hero.
 * No screenshots, no stock imagery — the UI sells itself.
 */
export function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] select-none">
      {/* Window frame */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-pop">
        {/* chrome */}
        <div className="flex items-center gap-1.5 border-b border-stone-100 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-md bg-stone-100 px-2.5 text-[11px] text-stone-400">
            giglet.app/kid/maya
          </div>
        </div>

        <div className="grid grid-cols-[1fr_170px] gap-3 p-4">
          {/* left: mission card */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                <Gamepad2 className="h-3 w-3" /> Scratch · Builder
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 20 pts
              </span>
            </div>
            <p className="mt-2.5 text-[13px] font-bold text-stone-900">Catch the Falling Stars</p>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              Use clones to make stars fall from the sky and catch them with your basket…
            </p>
            <div className="mt-3 space-y-1.5">
              {["Clones for the falling stars", "Score + lives variables", "Game over at 0 lives"].map((r) => (
                <div key={r} className="flex items-center gap-1.5 text-[10.5px] text-stone-500">
                  <CheckCircle2 className="h-3 w-3 text-brand-600" /> {r}
                </div>
              ))}
            </div>
            <div className="mt-3.5 h-8 rounded-lg bg-brand-600 text-center text-[11.5px] font-semibold leading-8 text-white">
              Submit my work
            </div>
          </div>

          {/* right: earnings panel */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-stone-200 bg-white p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">This week</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-stone-900">$25.00</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full w-[82%] rounded-full bg-brand-600" />
              </div>
              <p className="mt-1.5 text-[10px] text-stone-400">82% of weekly goal</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">Level 2</p>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 4 ? "bg-amber-400" : "bg-stone-100"}`} />
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-stone-400">140 lifetime points</p>
            </div>
          </div>
        </div>
      </div>

      {/* floating: donation notification */}
      <div className="absolute -left-4 -bottom-8 w-[240px] rounded-xl border border-stone-200 bg-white p-3.5 shadow-pop animate-fade-up sm:-left-10">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
            RM
          </span>
          <div>
            <p className="text-[11.5px] font-semibold text-stone-900">
              Grandma Rose sent <span className="text-brand-700">$10.00</span>
            </p>
            <p className="mt-0.5 text-[10.5px] leading-snug text-stone-500">
              “Bravo ya Maya! The dragon is wonderful.”
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-rose-500">
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> 2 supporters this week
            </p>
          </div>
        </div>
      </div>

      {/* floating: payout chip */}
      <div className="absolute -right-3 -top-6 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-pop animate-fade-up [animation-delay:120ms] sm:-right-8">
        <p className="text-[10px] font-medium text-stone-400">Weekly payout · Fri</p>
        <p className="text-[13px] font-bold tabular-nums text-stone-900">$36.00 sent 🎉</p>
      </div>
    </div>
  );
}
