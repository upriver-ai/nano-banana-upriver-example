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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <CardContent className="p-0 min-w-0">
        {code ? (
          <div className="h-64 min-w-0 w-full">
            <ScrollArea className="h-full w-full">
              <pre className="m-0 p-4 text-sm font-mono bg-muted dark:bg-muted/50 min-w-0 max-w-full w-full break-all whitespace-pre-wrap">
                <code className="block text-green-700 dark:text-green-300 min-w-0 break-all">
                  {code}
                </code>
              </pre>
            </ScrollArea>
          </div>
        ) : (
          <div className="p-6">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
