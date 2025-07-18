
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
import { signInSchema, type SignInValues } from "@/lib/form-schemas";
import { logIn } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Mail, Lock, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function SignInPage() {
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
        description: t('signInSuccess.description', { appName: APP_NAME }),
        variant: "default", 
      });
      router.push("/"); 
    } catch (error: any) {
      let errorMessage = t('errors.unexpected');
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = t('errors.invalidCredential');
            break;
          case "auth/invalid-email":
            errorMessage = t('errors.invalidEmail');
            break;
          case "auth/user-disabled":
            errorMessage = t('errors.userDisabled');
            break;
          default:
            errorMessage = `${t('errors.default')}: ${error.message}`;
        }
      }
      setAuthError(errorMessage);
      toast({
        title: t('signInFailed'),
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
        <p className="text-muted-foreground mt-2">{t('signInWelcome', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('signInTitle')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
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
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm gap-4">
          <p className="text-muted-foreground">
            {t('noAccountPrompt')}{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              {t('signUpLink')}
            </Link>
          </p>
           <div className="text-center w-full">
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-muted-foreground/20"></div>
              <span className="flex-shrink mx-2 text-xs text-muted-foreground">OR</span>
              <div className="flex-grow border-t border-muted-foreground/20"></div>
            </div>
            <Link href="/auth/recover" className="text-xs text-primary hover:underline">
              {t('recoverWithUniversalIdPrompt')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
