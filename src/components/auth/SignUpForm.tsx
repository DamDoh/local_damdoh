
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
import { signUpSchema, type SignUpValues } from "@/lib/form-schemas";
import { registerUser, logIn } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Mail, Lock, User, UserPlus, Briefcase } from "lucide-react";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import React from "react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { StakeholderIcon } from "@/components/icons/StakeholderIcon";

interface SignUpFormProps {
    onSuccess?: () => void;
}

const PasswordStrengthIndicator = ({ password = "" }) => {
    const t = useTranslations('Auth.passwordStrength');
    const strength = useMemo(() => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        return score;
    }, [password]);

    const getStrengthLabel = () => {
        switch (strength) {
            case 0:
            case 1:
            case 2:
                return t('weak');
            case 3:
                return t('medium');
            case 4:
                return t('strong');
            case 5:
                return t('veryStrong');
            default:
                return "";
        }
    };
    
    const progressColor = () => {
        switch (strength) {
            case 0:
            case 1:
            case 2:
                return "bg-red-500";
            case 3:
                return "bg-yellow-500";
            case 4:
                return "bg-green-500";
            case 5:
                return "bg-green-700";
            default:
                return "bg-gray-300";
        }
    }

    if (!password) return null;

    return (
        <div className="space-y-1">
            <Progress value={strength * 20} className="h-2 [&>div]:bg-red-500" indicatorClassName={progressColor()}/>
            <p className="text-xs text-muted-foreground">{t('label')}: <span className="font-semibold">{getStrengthLabel()}</span></p>
        </div>
    );
};

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Auth');
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

  const password = form.watch("password");

  async function onSubmit(data: SignUpValues) {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      await registerUser(data.name, data.email, data.password, data.role as any);
      await logIn(data.email, data.password);

      toast({
        title: t('signUpSuccess.title'),
        description: t('signUpSuccess.description', { appName: "DamDoh" }),
        variant: "default", 
      });
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = t('errors.emailInUse');
            break;
          case "auth/invalid-email":
            errorMessage = t('errors.invalidEmail');
            break;
          case "auth/weak-password":
            errorMessage = t('errors.weakPassword');
            break;
          default:
            errorMessage = t('errors.default');
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
          <AlertTitle>{t('signUpFailed')}</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />{t('nameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('namePlaceholder')} {...field} />
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
                <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />{t('roleLabel')}</FormLabel>
                <Select onValueChange={(value) => field.onChange(value as any)} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('rolePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STAKEHOLDER_ROLES.map((roleName) => (
                      <SelectItem key={roleName} value={roleName}>
                        <div className="flex items-center gap-2">
                          <StakeholderIcon role={roleName} className="h-4 w-4 text-muted-foreground" />
                          <span>{roleName}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />{t('passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                 <PasswordStrengthIndicator password={field.value} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('creatingAccountButton')}
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> {t('signUpButton')}
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
