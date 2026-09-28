import { InfiniteSlider } from "@/components/core/infinite-slider";
import { BrandIcon } from "@/components/interactive/BrandIcon";

export interface MarqueeItem {
  name: string;
  iconSlug?: string;
  variant: "solid" | "muted";
}

export function SkillsMarquee({
  items,
  reverse = false,
  speed = 60,
  speedOnHover,
}: {
  items: MarqueeItem[];
  reverse?: boolean;
  speed?: number;
  speedOnHover?: number;
}) {
  return (
    <InfiniteSlider
      speed={speed}
      speedOnHover={speedOnHover}
      gap={24}
      reverse={reverse}
      className="py-2"
    >
      {items.map((item, i) => (
        <div
          key={`${item.name}-${i}`}
          title={item.name}
          className={
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl border shadow-xs shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 cursor-default " +
            (item.variant === "muted"
              ? "bg-slate-200/80 dark:bg-slate-800/80 border-slate-300/80 dark:border-slate-700/80"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800")
          }
        >
          <BrandIcon
            slug={item.iconSlug}
            name={item.name}
            className="w-10 h-10 text-slate-800 dark:text-slate-100"
            initialClassName="font-mono text-sm font-bold text-slate-400 dark:text-slate-500"
          />
        </div>
      ))}
    </InfiniteSlider>
  );
}
