
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { signInSchema, type SignInValues } from "@/lib/form-schemas";
import { logIn } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

interface SignInFormProps {
    onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Auth');

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    setIsLoading(true);
    setAuthError(null);
    try {
      await logIn(data.email, data.password);
      toast({
        title: t('signInSuccess.title'),
        description: t('signInSuccess.description', { appName: "DamDoh" }),
        variant: "default", 
      });
      onSuccess?.(); // Call the callback on success
      router.push("/");
      router.refresh();
    } catch (error: any) {
      let errorMessage = t('errors.unexpected');
      if (error.message) {
        if (error.message === "Invalid credentials") {
          errorMessage = t('errors.invalidCredential');
        } else if (error.message === "Login failed") {
          errorMessage = t('errors.default');
        } else {
          errorMessage = `${t('errors.default')}: ${error.message}`;
        }
      }
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
    {authError && (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('signInFailed')}</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
        </Alert>
    )}
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />{t('emailLabel')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('passwordLabel')}</FormLabel>
                <Link href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline">
                  {t('forgotPasswordLink')}
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('signingInButton')}
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> {t('signInButton')}
            </>
          )}
        </Button>
      </form>
    </Form>
    </>
  );
}
