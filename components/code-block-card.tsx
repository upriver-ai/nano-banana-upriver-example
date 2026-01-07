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
          <div className="h-64">
            <ScrollArea className="h-full w-full">
              <pre className="m-0 p-4 text-sm font-mono bg-muted dark:bg-muted/50">
                <code className="block whitespace-pre-wrap wrap-break-word text-green-700 dark:text-green-300">
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
