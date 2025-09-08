
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  const t = useTranslations('Auth');

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
          <SignInForm />
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
