
import { cn } from "@/lib/utils";

export function AnimatedGridBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-background",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_farthest-side_at_50%_50%,transparent,hsl(var(--background)))]"></div>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,hsl(var(--primary)/0.15),transparent)]"></div>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(circle_800px_at_0%_-100px,hsl(var(--primary)/0.15),transparent)]"></div>
      {children}
    </div>
  );
}
