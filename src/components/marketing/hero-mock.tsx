/**
 * Hand-built CSS mock of the product for the landing hero.
 * No screenshots, no stock imagery, no icons — pure typography.
 */
export function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] select-none">
      {/* Window frame */}
      <div className="rounded-3xl border border-stone-200 bg-white shadow-pop">
        {/* chrome */}
        <div className="flex items-center gap-1.5 border-b border-stone-100 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-full bg-paper px-3 text-[11px] text-stone-400">
            fc-junior.app/kid/maya — creative studio
          </div>
        </div>

        <div className="grid grid-cols-[1fr_170px] gap-3 p-4">
          {/* left: quest card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-full bg-taxi-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-taxi-700 ring-1 ring-inset ring-taxi-200">
                Quest · Builder
              </span>
              <span className="text-[11px] font-extrabold text-amber-600">20 ★</span>
            </div>
            <p className="mt-2.5 font-display text-[15px] font-bold text-stone-900">Catch the Falling Stars</p>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              Make stars rain from the sky and catch them in your magic basket…
            </p>
            <div className="mt-3 space-y-1.5">
              {["Stars fall as clones", "Score + lives work", "Game over at 0 lives"].map((r, i) => (
                <div key={r} className="flex items-center gap-2 text-[10.5px] text-stone-500">
                  <span className="font-bold tabular-nums text-stone-300">{i + 1}.</span> {r}
                </div>
              ))}
            </div>
            <div className="mt-3.5 h-8 rounded-full bg-taxi-600 text-center text-[11.5px] font-bold leading-8 text-white">
              Share my build
            </div>
          </div>

          {/* right: earnings panel */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">This week</p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-stone-900">$25.00</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full w-[82%] rounded-full bg-taxi-500" />
              </div>
              <p className="mt-1.5 text-[10px] text-stone-400">82% · almost Friday</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Level 2</p>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 4 ? "bg-sun-400" : "bg-stone-100"}`} />
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-stone-400">140 ★ collected</p>
            </div>
          </div>
        </div>
      </div>

      {/* floating: cheer notification */}
      <div className="absolute -left-4 -bottom-8 w-[240px] rounded-2xl border border-stone-200 bg-white p-3.5 shadow-pop animate-fade-up sm:-left-10">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flame-500 text-[10px] font-bold text-white">
            RM
          </span>
          <div>
            <p className="text-[11.5px] font-bold text-stone-900">
              Grandma Rose cheered <span className="text-taxi-700">$10</span>
            </p>
            <p className="mt-0.5 text-[10.5px] leading-snug text-stone-500">
              “Bravo ya Maya! The dragon is wonderful.”
            </p>
            <p className="mt-1 text-[10px] font-semibold text-flame-500">2 cheers this week</p>
          </div>
        </div>
      </div>

      {/* floating: payday chip */}
      <div className="absolute -right-3 -top-6 rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-pop animate-fade-up [animation-delay:120ms] sm:-right-8">
        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Friday payday</p>
        <p className="font-display text-[14px] font-extrabold tabular-nums text-stone-900">$36.00 landed</p>
      </div>
    </div>
  );
}
