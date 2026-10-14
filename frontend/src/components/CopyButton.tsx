import { useState } from "react";
import { Button, type ButtonProps } from "@chakra-ui/react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "outline",
  w,
}: {
  text: string;
  label?: string;
  size?: "xs" | "sm" | "md";
  variant?: "outline" | "solid" | "ghost";
  w?: ButtonProps["w"];
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard permission denied */
    }
  };
  return (
    <Button
      size={size}
      w={w}
      variant={variant}
      leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
      onClick={onCopy}
      isDisabled={!text}
      aria-live="polite"
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
