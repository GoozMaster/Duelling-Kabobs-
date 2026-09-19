"use client";

import type { ReactNode } from "react";

import s from "./home.module.css";
import { useEnterOnce } from "./use-enter-once";

/** Dips in from below and settles, once, the first time it is seen. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ref, entered] = useEnterOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${s.reveal} ${entered ? s.in : ""} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
