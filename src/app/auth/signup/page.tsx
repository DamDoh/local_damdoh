
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
import { AlertTriangle, Loader2, Mail, Lock, User, UserPlus, Briefcase, Sprout, Package, TrendingUp, Warehouse, Lightbulb, Landmark, Truck, Compass, BookOpen, Users, Factory, ShoppingBag, Globe, Scale, Clipboard, Recycle, Bolt, Banknote, Calendar, Network, MessageSquare, Tractor, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME, STAKEHOLDER_ROLES } from "@/lib/constants";
import type { StakeholderRole } from "@/lib/constants";
import React from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
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

  // Mapping of stakeholder roles to Lucide icons
  const STAKEHOLDER_ICONS: Record<string, React.ElementType> = {
    'Farmer': Sprout,
    'Agricultural Cooperative': Building2,
    'Buyer (Restaurant, Supermarket, Exporter)': Briefcase,
    'Input Supplier (Seed, Fertilizer, Pesticide)': ShoppingBag,
    'Financial Institution (Micro-finance/Loans)': Banknote,
    'Logistics Partner (Third-Party Transporter)': Truck,
    'Processing & Packaging Unit': Factory,
    'Agro-Export Facilitator/Customs Broker': TrendingUp,
    'Government Regulator/Auditor': Scale,
    'Field Agent/Agronomist (DamDoh Internal)': Compass,
    'Operations/Logistics Team (DamDoh Internal)': Truck,
    'Technology/Data Team (DamDoh Internal)': Bolt,
    'Community Manager (DamDoh Internal)': Users,
    'Agro-Tourism Operator': Globe,
    'Researcher/Academic': BookOpen,
    'Extension Worker': MessageSquare,
    'NGO/Development Partner': Network,
    'Environmental Specialist': Recycle,
    'Crowdfunder (Impact Investor, Individual)': Banknote,
    'Quality Assurance Team (DamDoh Internal)': Clipboard,
    'Equipment Supplier (Sales of Machinery/IoT)': Tractor,
    'Certification Body (Organic, Fair Trade etc.)': Scale,
    'Consumer': User,
    'Storage/Warehouse Facility': Warehouse,
    'Agronomy Expert/Consultant (External)': BookOpen,
    'Retailer/City Market Seller': ShoppingBag,
    'Waste Management & Compost Facility': Recycle,
    'Agri-Tech Innovator/Developer': Lightbulb,
  };

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
        <p className="text-muted-foreground mt-2">Join the ${APP_NAME} Agricultural Network!</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join our community of agricultural stakeholders.</CardDescription>
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
                    <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Full Name / Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name or Company Name" {...field} />
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
                    <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Your Primary Role</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value as StakeholderRole)} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role in the supply chain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAKEHOLDER_ROLES.map((role) => (
                          <SelectItem key={role} value={role} className="flex items-center gap-2">
                             {React.createElement(STAKEHOLDER_ICONS[role] || Users, { className: "mr-2 h-4 w-4 text-muted-foreground" })}
                            <span>{role}</span>
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
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Email Address</FormLabel>
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
                    <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="•••••••• (min. 6 characters)" {...field} />
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
                    <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" />Confirm Password</FormLabel>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
