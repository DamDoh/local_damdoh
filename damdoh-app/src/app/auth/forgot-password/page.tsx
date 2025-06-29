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
import { AlertTriangle, CheckCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

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
      setSentToEmail(data.email);
      toast({
        title: t('forgotPasswordPage.successTitle'),
        description: t('forgotPasswordPage.successDescription', { email: data.email }),
        variant: "default",
      });
      form.reset(); 
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            setEmailSent(true); 
            setSentToEmail(data.email);
            toast({
                title: t('forgotPasswordPage.successTitle'),
                description: t('forgotPasswordPage.successDescription', { email: data.email }),
            });
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please try again later.";
            break;
          default:
            errorMessage = `Failed to send reset email: ${error.message}`;
        }
      }
      if (!emailSent) {
        setAuthError(errorMessage);
        toast({
            title: "Error",
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
        <p className="text-muted-foreground mt-2">{t('forgotPasswordPage.prompt', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('forgotPasswordPage.title')}</CardTitle>
          <CardDescription>{t('forgotPasswordPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && !emailSent && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <>
              <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
                <AlertTitle>{t('forgotPasswordPage.successTitle')}</AlertTitle>
                <AlertDescription>
                  {t('forgotPasswordPage.successDescription', { email: sentToEmail })}
                </AlertDescription>
              </Alert>
              <div className="text-center mt-6">
                <Button asChild>
                  <Link href="/auth/signin">{t('signIn')}</Link>
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
                      <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />{t('forgotPasswordPage.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('forgotPasswordPage.sendingButton')}
                    </>
                  ) : (
                    t('forgotPasswordPage.sendButton')
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