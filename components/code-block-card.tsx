"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CodeBlockCardProps {
  title: string;
  description?: string;
  actionLink?: string;
  actionIcon?: LucideIcon;
  code?: string;
  maxHeight?: number;
  children?: React.ReactNode;
}

export function CodeBlockCard({
  title,
  actionLink,
  actionIcon: ActionIcon,
  description,
  code,
  maxHeight = 200,
  children,
}: CodeBlockCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const codeRef = React.useRef<HTMLDivElement>(null);
  const [needsTruncation, setNeedsTruncation] = React.useState(false);

  React.useEffect(() => {
    if (codeRef.current) {
      const height = codeRef.current.scrollHeight;
      setNeedsTruncation(height > maxHeight);
    }
  }, [code, maxHeight]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {actionLink && ActionIcon && (
          <CardAction>
            <Button
              size="icon"
              variant="ghost"
              asChild
            >
              <Link
                href={actionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ActionIcon className="size-4" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {code ? (
          <div className="relative">
            <div
              ref={codeRef}
              className="overflow-hidden transition-all duration-200"
              style={{
                maxHeight:
                  !isExpanded && needsTruncation ? `${maxHeight}px` : "none",
              }}
            >
              <pre className="m-0 p-4 text-sm font-mono overflow-x-auto bg-muted dark:bg-muted/50">
                <code className="block whitespace-pre-wrap wrap-break-word text-green-700 dark:text-green-300">
                  {code}
                </code>
              </pre>
            </div>
            {needsTruncation && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center py-2 pointer-events-none">
                <div className="absolute inset-0 bg-white dark:bg-black" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs relative z-10 pointer-events-auto"
                >
                  <ChevronDownIcon className="size-3 mr-1" />
                  Show More
                </Button>
              </div>
            )}
            {needsTruncation && isExpanded && (
              <div className="flex items-center justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  <ChevronUpIcon className="size-3 mr-1" />
                  Show Less
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
