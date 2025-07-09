"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/form-schemas";
import { resetPassword } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const { toast } = useToast();
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!oobCode) {
      setAuthError(t('resetPassword.errors.missingCode'));
    }
  }, [oobCode, t]);

  async function onSubmit(data: ResetPasswordValues) {
    if (!oobCode) {
      setAuthError(t('resetPassword.errors.missingCode'));
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setIsResetSuccessful(false);

    try {
      await resetPassword(oobCode, data.password);
      setIsResetSuccessful(true);
      toast({
        title: t('resetPassword.successTitle'),
        description: t('resetPassword.successDescription'),
        variant: "default",
      });
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: any) {
      let errorMessage = t('resetPassword.errors.unexpected');
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-action-code":
          case "auth/expired-action-code":
            errorMessage = t('resetPassword.errors.invalidOrExpiredCode');
            break;
          case "auth/user-disabled":
            errorMessage = t('resetPassword.errors.userDisabled');
            break;
          case "auth/user-not-found":
            errorMessage = t('resetPassword.errors.userNotFound');
            break;
          case "auth/weak-password":
              errorMessage = t('resetPassword.errors.weakPassword');
              break;
          default:
            errorMessage = `${t('resetPassword.errors.default')}: ${error.message}`;
        }
      }
      setAuthError(errorMessage);
      toast({
          title: t('error'),
          description: errorMessage,
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 py-12 px-4">
      <div className="mb-8 text-center">
         <Logo iconSize={48} textSize="text-4xl" className="text-primary justify-center" />
        <p className="text-muted-foreground mt-2">{t('resetPasswordPrompt', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription>{t('resetPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
           {isResetSuccessful && (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
              <AlertTitle>{t('resetPassword.successTitle')}</AlertTitle>
              <AlertDescription>
                {t('resetPassword.successRedirect')}
              </AlertDescription>
            </Alert>
          )}

          {!oobCode && !authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('resetPassword.errors.missingCodeTitle')}</AlertTitle>
                <AlertDescription>
                  {t('resetPassword.errors.missingCodeDescription')}
                </AlertDescription>
              </Alert>
          )}

          {oobCode && !isResetSuccessful && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('newPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('newPasswordPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('confirmPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('confirmPasswordPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('resettingPasswordButton')}
                    </>
                  ) : (
                    t('resetPasswordButton')
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            {t('rememberPasswordPrompt')}{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}