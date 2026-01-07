"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
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
  children?: React.ReactNode;
}

export function CodeBlockCard({
  title,
  actionLink,
  actionIcon: ActionIcon,
  description,
  code,
  children,
}: CodeBlockCardProps) {
  return (
    <Card className="w-full min-w-0 max-w-full">
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
      <CardContent className="px-2 py-0min-w-0">
        {code ? (
          <div className="max-h-96 min-w-0 w-full overflow-auto [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]">
            <pre className="m-0 p-4 text-sm font-mono bg-muted dark:bg-muted/50 min-w-0 max-w-full w-full break-all whitespace-pre-wrap">
              <code className="block text-green-700 dark:text-green-300 min-w-0 break-all">
                {code}
              </code>
            </pre>
          </div>
        ) : (
          <div className="p-6">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
