/** Fire a toast from anywhere on the client. ToastHost listens for these. */
export function toast(msg: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ila-toast", { detail: msg }));
}
