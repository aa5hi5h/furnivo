"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps, toast as sonner } from "sonner"

/* ---------- re-export toast with 3s timeout & coloured backgrounds ---------- */
export const toast = {
  success: (title: string, opts?: Parameters<typeof sonner.success>[1]) =>
    sonner.success(title, {
      duration: 3000,
      className: "bg-green-600 text-white",
      ...opts,
    }),
  error: (title: string, opts?: Parameters<typeof sonner.error>[1]) =>
    sonner.error(title, {
      duration: 3000,
      className: "bg-red-600 text-white",
      ...opts,
    }),
  info: (title: string, opts?: Parameters<typeof sonner.info>[1]) =>
    sonner.info(title, { duration: 3000, ...opts }),
  warning: (title: string, opts?: Parameters<typeof sonner.warning>[1]) =>
    sonner.warning(title, { duration: 3000, ...opts }),
  message: (title: string, opts?: Parameters<typeof sonner>[1]) =>
    sonner(title, { duration: 3000, ...opts }),
}

/* ---------- toaster component ---------- */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }