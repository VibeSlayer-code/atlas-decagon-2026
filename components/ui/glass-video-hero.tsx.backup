"use client"
interface GlassVideoHeroProps {
  badge?: string
  title: string
  description: string
}
// Intentionally left blank; provide a real URL when this component is used.
const VIDEO_URL = ""
export function GlassVideoHero({ badge = "Auth", title, description }: GlassVideoHeroProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,24,0.32)_0%,rgba(10,6,24,0.72)_100%)]" />
      <div className="relative z-10 flex h-full items-end p-8 xl:p-10">
        <div className="w-full rounded-2xl border border-[rgba(181,23,158,0.35)] bg-[rgba(19,12,42,0.58)] p-6 backdrop-blur-xl">
          <span className="inline-flex rounded-md border border-[rgba(247,37,133,0.45)] bg-[rgba(86,11,173,0.4)] px-2.5 py-1 text-xs font-medium text-white">
            {badge}
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-white/80">{description}</p>
        </div>
      </div>
    </div>
  )
}
