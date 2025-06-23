
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
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
        title: "Password Reset Email Sent",
        description: `If an account exists for ${data.email}, a password reset link has been sent. Please check your inbox (and spam folder).`,
        variant: "default",
      });
      form.reset(); 
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            // For security, we might not want to reveal if an email is registered or not.
            // So, show a generic success message even if the user isn't found.
            setEmailSent(true); // Pretend it was sent
            toast({
                title: "Password Reset Email Sent (If Account Exists)",
                description: `If an account exists for ${data.email}, a password reset link has been sent.`,
            });
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          default:
            errorMessage = `Failed to send reset email: ${error.message}`;
        }
      }
      if (!emailSent) { // Only set error if we didn't show the generic success message
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
        <p className="text-muted-foreground mt-2">Reset your ${APP_NAME} password</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && !emailSent && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          {emailSent && (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle className="h-4 w-4 !text-green-500 dark:!text-green-400" />
              <AlertTitle>Email Sent</AlertTitle>
              <AlertDescription>
                If an account exists for the email you entered, a password reset link has been sent. Please check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}
          {!emailSent && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Email Address</FormLabel>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Email...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
