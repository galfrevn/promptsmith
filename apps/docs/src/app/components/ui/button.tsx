"use client";

import { type MotionProps, motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

type MotionButtonProps = MotionProps & {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
};

type HTMLButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "ref"
>;

const Button = React.forwardRef<
  HTMLButtonElement,
  MotionButtonProps & HTMLButtonProps
>(({ asChild = false, children, className, ...props }, ref) => {
  const classNames = cn(
    "justify flex h-12 items-center rounded-lg bg-primary px-6 text-white",
    className
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement;
    return (
      <motion.span whileTap={{ scale: 0.93 }}>
        {React.cloneElement(child, {
          // @ts-ignore
          className: cn(child.props.className, classNames),
          ref,
          ...props,
        })}
      </motion.span>
    );
  }

  return (
    <motion.button
      className={classNames}
      transition={{ duration: 0.7, type: "spring" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.93 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export { Button };
