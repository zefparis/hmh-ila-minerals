"use client";

import { useEffect, useRef, useState } from "react";

export { toast } from "@/lib/toast";

export function ToastHost() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setShow(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setShow(false), 2600);
    };
    window.addEventListener("ila-toast", on);
    return () => {
      window.removeEventListener("ila-toast", on);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className={`toast${show ? " show" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
