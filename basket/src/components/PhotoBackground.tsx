// Dua kolom foto di belakang konten: kiri scroll naik, kanan scroll turun.
// Loop mulus: tiap kolom berisi 2 salinan identik, animasi geser -50%.
const LEFT = [1, 3, 5];
const RIGHT = [2, 4, 6];

function Column({ ids, dir }: { ids: number[]; dir: "up" | "down" }) {
  // Ulang 3x per salinan supaya satu salinan selalu lebih tinggi dari layar.
  const copy = [...ids, ...ids, ...ids];
  return (
    <div className="overflow-hidden">
      <div className={dir === "up" ? "bg-scroll-up" : "bg-scroll-down"}>
        {[0, 1].map((n) => (
          <div key={n} aria-hidden={n === 1} className="flex flex-col gap-3 pb-3">
            {copy.map((id, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={`/bg/${id}.jpg`}
                alt=""
                decoding="async"
                className="w-full rounded-2xl object-cover shadow-[0_18px_40px_-10px_rgba(0,0,0,0.8)]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PhotoBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060a]">
        {/* Bidang foto dimiringkan dalam perspektif 3D */}
        <div className="absolute inset-0" style={{ perspective: "900px", perspectiveOrigin: "50% 40%" }}>
          <div
            className="absolute -inset-x-[22%] -inset-y-[30%] grid grid-cols-2 gap-5 px-3 opacity-[0.4] saturate-[0.85]"
            style={{ transform: "rotateX(22deg) rotateY(-16deg) rotateZ(6deg) scale(1.15)" }}
          >
            <Column ids={LEFT} dir="up" />
            <div className="mt-24">
              <Column ids={RIGHT} dir="down" />
            </div>
          </div>
        </div>
        {/* Gradient gelap + glow supaya teks tetap terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/80 via-[#05060a]/35 to-[#05060a]/85" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-lime/25 blur-[110px]" />
        <div className="absolute -right-32 top-[28rem] h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
      </div>
      {/* Grain di atas semuanya (statis, tidak menghalangi klik) */}
      <div aria-hidden className="grain pointer-events-none fixed z-50" />
    </>
  );
}
