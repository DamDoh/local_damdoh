
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
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
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
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now sign in with your new password.",
        variant: "default",
      });
      // Redirect to sign-in page after a short delay
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
          title: "Error",
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
           {isResetSuccessful && (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your password has been reset successfully. Redirecting to sign-in...
              </AlertDescription>
            </Alert>
          )}

          {!oobCode && !authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Code</AlertTitle>
                <AlertDescription>
                  The password reset code is missing from the URL. Please use the link from your reset email.
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
