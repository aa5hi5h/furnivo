"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps, toast as sonner } from "sonner"

/* ---------- re-export toast with 2s timeout & coloured backgrounds ---------- */
export const toast = {
  success: (title: string, opts?: Parameters<typeof sonner.success>[1]) =>
    sonner.success(title, {
      duration: 2000,
      style: {
        background: "#16a34a",
        color: "white",
        border: "none",
        borderRadius: "6px",
      },
      ...opts,
    }),
  error: (title: string, opts?: Parameters<typeof sonner.error>[1]) =>
    sonner.error(title, {
      duration: 2000,
      style: {
        background: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "6px",
      },
      ...opts,
    }),
  info: (title: string, opts?: Parameters<typeof sonner.info>[1]) =>
    sonner.info(title, {
      duration: 2000,
      style: {
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
      },
      ...opts,
    }),
  warning: (title: string, opts?: Parameters<typeof sonner.warning>[1]) =>
    sonner.warning(title, {
      duration: 2000,
      style: {
        background: "#ea580c",
        color: "white",
        border: "none",
        borderRadius: "6px",
      },
      ...opts,
    }),
  message: (title: string, opts?: Parameters<typeof sonner>[1]) =>
    sonner(title, {
      duration: 2000,
      style: {
        background: "#64748b",
        color: "white",
        border: "none",
        borderRadius: "6px",
      },
      ...opts,
    }),
}

/* ---------- toaster component ---------- */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      visibleToasts={3}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        duration: 2000,
      }}
      {...props}
    />
  )
}

export { Toaster }