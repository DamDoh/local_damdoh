
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
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const oobCode = searchParams.get("oobCode");
  const { toast } = useToast();
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
      setAuthError("Password reset code is missing or invalid.");
    }
  }, [oobCode]);

  async function onSubmit(data: ResetPasswordValues) {
    if (!oobCode) {
      setAuthError("Password reset code is missing or invalid.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setIsResetSuccessful(false);

    try {
      await resetPassword(oobCode, data.password);
      setIsResetSuccessful(true);
      toast({
        title: t('resetPasswordPage.successTitle'),
        description: t('resetPasswordPage.successDescription'),
        variant: "default",
      });
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred while resetting your password.";
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-action-code":
          case "auth/expired-action-code":
            errorMessage = "The password reset code is invalid or has expired.";
            break;
          case "auth/user-disabled":
            errorMessage = "Your account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "The user account was not found.";
            break;
          case "auth/weak-password":
              errorMessage = "The password is too weak.";
              break;
          default:
            errorMessage = `Failed to reset password: ${error.message}`;
        }
      }
      setAuthError(errorMessage);
      toast({
          title: t('resetPasswordPage.errorTitle'),
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
        <p className="text-muted-foreground mt-2">{t('resetPasswordPage.prompt', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('resetPasswordPage.title')}</CardTitle>
          <CardDescription>{t('resetPasswordPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('resetPasswordPage.errorTitle')}</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
           {isResetSuccessful && (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
              <AlertTitle>{t('resetPasswordPage.successTitle')}</AlertTitle>
              <AlertDescription>
                {t('resetPasswordPage.successDescription')}
              </AlertDescription>
            </Alert>
          )}

          {!oobCode && !authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('resetPasswordPage.missingCodeTitle')}</AlertTitle>
                <AlertDescription>
                  {t('resetPasswordPage.missingCodeDescription')}
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
                      <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('resetPasswordPage.newPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('resetPasswordPage.newPasswordPlaceholder')} {...field} />
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
                      <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('resetPasswordPage.confirmPasswordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('signInPage.confirmPasswordPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('resetPasswordPage.resettingButton')}
                    </>
                  ) : (
                    t('resetPasswordPage.resetButton')
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            {t('forgotPasswordPage.rememberPrompt')}{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
