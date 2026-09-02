import { getAgentBadge } from "@/utils/agent-badge";

interface AgentBadgeProps {
  agent?: string | null;
  className?: string;
}

export function AgentBadge({ agent, className = "" }: AgentBadgeProps) {
  const info = getAgentBadge(agent);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${info.className} ${className}`}
      title={`Answered by ${info.label} agent`}
    >
      <span aria-hidden>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
