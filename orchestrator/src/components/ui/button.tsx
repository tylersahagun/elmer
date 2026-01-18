"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Liquid button variant styles
const liquidButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          '[--liquid-button-background-color:hsl(var(--primary))] [--liquid-button-color:hsl(var(--primary-foreground))] text-primary-foreground shadow-xs',
        destructive:
          '[--liquid-button-background-color:hsl(var(--destructive))] [--liquid-button-color:hsl(var(--destructive-foreground))] text-white shadow-xs focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        secondary:
          '[--liquid-button-background-color:hsl(var(--secondary))] [--liquid-button-color:hsl(var(--secondary-foreground))] text-secondary-foreground shadow-xs',
        outline:
          '[--liquid-button-background-color:transparent] [--liquid-button-color:hsl(var(--primary))] border border-input bg-background shadow-xs',
        ghost:
          '[--liquid-button-background-color:transparent] [--liquid-button-color:hsl(var(--accent))] hover:text-accent-foreground',
        link:
          '[--liquid-button-background-color:transparent] [--liquid-button-color:hsl(var(--primary))] text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  liquid?: boolean;
  liquidDelay?: string;
  liquidFillHeight?: string;
  hoverScale?: number;
  tapScale?: number;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  liquid = false,
  liquidDelay = "0.3s",
  liquidFillHeight = "3px",
  hoverScale = 1.02,
  tapScale = 0.98,
  ...props
}: ButtonProps) {
  // Non-liquid button (original behavior)
  if (!liquid) {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }

  // Liquid button with animation
  return (
    <motion.button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      whileTap={{ scale: tapScale }}
      whileHover={{
        scale: hoverScale,
        '--liquid-button-fill-width': '100%',
        '--liquid-button-fill-height': '100%',
        '--liquid-button-delay': liquidDelay,
        transition: {
          '--liquid-button-fill-width': { duration: 0 },
          '--liquid-button-fill-height': { duration: 0 },
          '--liquid-button-delay': { duration: 0 },
        },
      } as HTMLMotionProps<"button">["whileHover"]}
      style={
        {
          '--liquid-button-fill-width': '-1%',
          '--liquid-button-fill-height': liquidFillHeight,
          '--liquid-button-delay': '0s',
          background:
            'linear-gradient(var(--liquid-button-color) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
          backgroundColor: 'var(--liquid-button-background-color)',
          transition: `background ${liquidDelay} var(--liquid-button-delay, 0s), color ${liquidDelay} ${liquidDelay}, background-position ${liquidDelay} calc(${liquidDelay} - var(--liquid-button-delay, 0s))`,
        } as React.CSSProperties
      }
      className={cn(liquidButtonVariants({ variant, size, className }))}
      {...(props as HTMLMotionProps<"button">)}
    />
  )
}

export { Button, buttonVariants }
