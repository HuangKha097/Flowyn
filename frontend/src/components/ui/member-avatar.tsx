import { cn } from "@/lib/utils";
import { getMember } from "@/lib/mock-data";

export function Avatar({
  memberId,
  size = 32,
  className,
}: {
  memberId: string;
  size?: number;
  className?: string;
}) {
  const member = getMember(memberId);
  if (!member) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-foreground ring-2 ring-surface",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: member.color,
        fontSize: size * 0.4,
      }}
      title={member.name}
    >
      {member.initials}
    </span>
  );
}
