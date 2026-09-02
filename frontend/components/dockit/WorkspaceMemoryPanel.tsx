"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Cloud,
  Database,
  Layers,
  Shield,
  Smartphone,
  Laptop,
} from "lucide-react";

const STACK = [
  {
    icon: Database,
    color: "#7BE1A4",
    title: "Neon PostgreSQL",
    body: "Permanent chat history & session records",
  },
  {
    icon: Layers,
    color: "#FFD97B",
    title: "Redis cache",
    body: "Fast multi-turn context between messages",
  },
  {
    icon: Brain,
    color: "#979BFF",
    title: "Mem0 insights",
    body: "Personalization that follows you across devices",
  },
  {
    icon: Shield,
    color: "#FF8585",
    title: "Scope guard",
    body: "8 subject agents — academic focus only",
  },
];

export function WorkspaceMemoryPanel() {
  return (
    <div className="memory-panel">
      <div className="memory-panel-header">
        <div className="memory-panel-title">
          <Cloud className="h-5 w-5 text-[#D76D77]" />
          <span>Memory & sync</span>
        </div>
        <span className="memory-sync-badge">
          <span className="memory-sync-dot" />
          Live sync
        </span>
      </div>

      <div className="memory-devices">
        <div className="memory-device">
          <Laptop className="h-4 w-4" />
          <span>Laptop</span>
        </div>
        <div className="memory-flow">
          <span className="memory-flow-line" />
          <Cloud className="h-5 w-5 text-[#D76D77]" />
          <span className="memory-flow-line" />
        </div>
        <div className="memory-device">
          <Smartphone className="h-4 w-4" />
          <span>Phone</span>
        </div>
      </div>

      <ul className="memory-stack">
        {STACK.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="memory-stack-item"
          >
            <div
              className="memory-stack-icon"
              style={{ color: item.color, borderColor: `${item.color}33` }}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="memory-stack-title">{item.title}</p>
              <p className="memory-stack-body">{item.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
