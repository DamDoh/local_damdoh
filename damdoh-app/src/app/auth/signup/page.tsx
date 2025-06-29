
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { signUpSchema, type SignUpValues } from "@/lib/form-schemas";
import { registerUser } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Mail, Lock, User, UserPlus, Briefcase, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME, STAKEHOLDER_ROLES, STAKEHOLDER_ICONS } from "@/lib/constants";
import type { StakeholderRole } from "@/lib/constants";
import React from "react";
import { useTranslation } from "react-i18next";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpValues) {
    setIsLoading(true);
    setAuthError(null);
    try {
      await registerUser(data.name, data.email, data.password, data.role as StakeholderRole);
      toast({
        title: "Account Created Successfully!",
        description: "You can now sign in with your new credentials.",
        variant: "default", 
      });
      router.push("/auth/signin"); 
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email address is already registered. Try signing in.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/weak-password":
            errorMessage = "The password is too weak. Please choose a stronger password.";
            break;
          default:
            errorMessage = `Registration failed: ${error.message}`;
        }
      }
      setAuthError(errorMessage);
      toast({
        title: "Sign Up Failed",
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
        <p className="text-muted-foreground mt-2">{t('signUpPage.welcome', { appName: APP_NAME })}</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('signUpPage.title')}</CardTitle>
          <CardDescription>{t('signUpPage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />{t('signUpPage.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('signUpPage.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />{t('signUpPage.roleLabel')}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value as StakeholderRole)} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('signUpPage.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAKEHOLDER_ROLES.map((role) => {
                          const Icon = STAKEHOLDER_ICONS[role] || Users;
                          return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{role}</span>
                            </div>
                          </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('signUpPage.passwordPlaceholder')} {...field} />
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
                    <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('signUpPage.confirmPasswordLabel')}</FormLabel>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('signUpPage.creatingAccountButton')}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> {t('signUpPage.signUpButton')}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            {t('alreadyHaveAccountPrompt')}{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
