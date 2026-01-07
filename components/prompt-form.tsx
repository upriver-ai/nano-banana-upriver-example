"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  brandUrl: z.string().min(1, {
    message: "Brand URL is required.",
  }),
  brief: z.string().optional(),
});

export type PromptFormValues = z.infer<typeof formSchema>;

interface PromptFormProps {
  onSubmit: (values: PromptFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PromptForm({
  onSubmit,
  isLoading = false,
  error,
}: PromptFormProps) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandUrl: "",
      brief: "",
    },
  });

  const handleSubmit = (values: PromptFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-5"
      >
        <h2 className="text-lg font-bold">Get Started</h2>
        <FormField
          control={form.control}
          name="brandUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand URL</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="https://acme.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brief"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Instructions (optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Generate an image that's on-brand and aligned with their audience"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="self-start"
        >
          <SparklesIcon className="size-4" />
          {isLoading ? "Generating..." : "Generate Image"}
        </Button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </Form>
  );
}
