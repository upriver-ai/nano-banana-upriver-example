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
import { Spinner } from "@/components/ui/spinner";

export enum CodeBlockStatus {
  NOT_STARTED = "not_started",
  LOADING = "loading",
  ERROR = "error",
  SUCCESS = "success",
}

interface CodeBlockCardProps {
  title: string;
  description?: string;
  actionLink?: string;
  actionIcon?: LucideIcon;
  code?: string;
  children?: React.ReactNode;
  status?: CodeBlockStatus;
}

export function CodeBlockCard({
  title,
  actionLink,
  actionIcon: ActionIcon,
  description,
  code,
  children,
  status = CodeBlockStatus.NOT_STARTED,
}: CodeBlockCardProps) {
  const renderStatusIcon = () => {
    if (status === CodeBlockStatus.NOT_STARTED) {
      return null;
    }
    if (status === CodeBlockStatus.LOADING) {
      return <Spinner className="size-4 -mb-0.5" />;
    }
    if (status === CodeBlockStatus.ERROR) {
      return <span className="text-lg -mb-0.5">❌</span>;
    }
    if (status === CodeBlockStatus.SUCCESS) {
      return <span className="text-lg -mb-0.5">✅</span>;
    }
    return null;
  };

  return (
    <Card className="w-full min-w-0 max-w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-mono">
          {title}
          {renderStatusIcon()}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {actionLink && ActionIcon && (
          <CardAction>
            <Button
              variant="outline"
              asChild
            >
              <Link
                href={actionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
                <ActionIcon className="size-4" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-2 py-0 min-w-0">
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
