
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/form-schemas";
import { sendPasswordReset } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2, Mail, Send } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true);
    setAuthError(null);
    setEmailSent(false);
    try {
      await sendPasswordReset(data.email);
      setEmailSent(true);
      toast({
        title: t('forgotPassword.emailSentTitle'),
        description: t('forgotPassword.emailSentDescription', { email: data.email }),
        variant: "default",
      });
      form.reset(); 
    } catch (error: any) {
      let errorMessage = t('forgotPassword.errors.unexpected');
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            // For security, we might not want to reveal if an email is registered or not.
            // So, show a generic success message even if the user isn't found.
            setEmailSent(true); // Pretend it was sent
            toast({
                title: t('forgotPassword.emailSentTitle'),
                description: t('forgotPassword.emailSentDescriptionIfAccountExists', { email: data.email }),
            });
            break;
          case "auth/invalid-email":
            errorMessage = t('forgotPassword.errors.invalidEmail');
            break;
          case "auth/too-many-requests":
             errorMessage = t('forgotPassword.errors.tooManyRequests');
             break;
          default:
            errorMessage = `${t('forgotPassword.errors.default')}: ${error.message}`;
        }
      }
      if (!emailSent) { // Only set error if we didn't show the generic success message
        setAuthError(errorMessage);
        toast({
            title: t('error'),
            description: errorMessage,
            variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 py-12 px-4">
      <div className="mb-8 text-center">
         <Logo iconSize={48} textSize="text-4xl" className="text-primary justify-center" />
        <p className="text-muted-foreground mt-2">{t('forgotPasswordResetPrompt', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('forgotPasswordTitle')}</CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && !emailSent && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <>
                <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
                  <AlertTitle>{t('forgotPassword.successTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('forgotPassword.successDescription')}
                  </AlertDescription>
                </Alert>

             <div className="text-center mt-6">
                 <Button asChild>
                    <Link href="/auth/signin">{t('signInButton')}</Link>
                 </Button>
             </div>
            </>
          ) : (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('sendingEmailButton')}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> {t('sendResetLinkButton')}
                    </>
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
