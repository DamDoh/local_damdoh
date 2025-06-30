"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Share2, PlusCircle, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


const couponFormSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(20),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Value must be positive"),
  expiryDate: z.date({
    required_error: "An expiry date is required.",
  }),
  usageLimit: z.coerce.number().int().positive("Limit must be a positive number"),
});


const CouponCreationForm = () => {
    const t = useTranslations('AgriEvents.promotions');
    const form = useForm<z.infer<typeof couponFormSchema>>({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
        },
    });

    function onSubmit(values: z.infer<typeof couponFormSchema>) {
        console.log("Creating coupon:", values);
        // Placeholder for submission logic
    }

    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <PlusCircle className="h-6 w-6"/>
                    <CardTitle className="text-lg">{t('create.title')}</CardTitle>
                </div>
                <CardDescription>{t('create.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('create.form.code')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('create.form.codePlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="usageLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('create.form.usageLimit')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder={t('create.form.usageLimitPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                             <FormField
                                control={form.control}
                                name="discountType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('create.form.discountType')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('create.form.discountTypePlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">{t('create.form.percentage')}</SelectItem>
                                                <SelectItem value="fixed">{t('create.form.fixed')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discountValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('create.form.discountValue')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10 or 5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel className="mb-2">{t('create.form.expiryDate')}</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? (format(field.value, "PPP")) : (<span>{t('create.form.pickDate')}</span>)}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {t('create.form.submitButton')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const ExistingCouponsList = () => {
    const t = useTranslations('AgriEvents.promotions');
    const { toast } = useToast();
    const coupons = [
        { id: '1', code: 'EARLYBIRD10', discount: '10% off', uses: 15, limit: 100, expiry: '2024-12-31' },
        { id: '2', code: 'DAMDOH5', discount: '$5 off', uses: 45, limit: 200, expiry: '2024-11-30' },
    ];

    const handleShare = (code: string) => {
        // This is a client-side component, so we can use window.
        // In a real app, the event ID would come from component props or URL params hook.
        const eventId = window.location.pathname.split('/')[2]; 
        const shareLink = `${window.location.origin}/agri-events/${eventId}?coupon=${code}`;
        navigator.clipboard.writeText(shareLink);
        toast({
            title: t('list.toastTitle'),
            description: t('list.toastDescription', { link: shareLink }),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('list.title')}</CardTitle>
                <CardDescription>{t('list.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {coupons.map((coupon) => (
                    <Card key={coupon.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-primary"/>
                                <p className="text-lg font-bold">{coupon.code}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {coupon.discount} | {t('list.expires')}: {coupon.expiry}
                            </p>
                            <p className="text-sm">
                                {t('list.usage')}: {coupon.uses} / {coupon.limit}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleShare(coupon.code)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            {t('list.share')}
                        </Button>
                    </Card>
                ))}
                 {coupons.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground pt-4">{t('list.noCoupons')}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default function ManageEventPage() {
    const t = useTranslations('AgriEvents.manage');

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground mb-6">{t('subtitlePlaceholder')}</p>

            <Tabs defaultValue="promotions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">{t('tabs.dashboard')}</TabsTrigger>
                    <TabsTrigger value="attendees">{t('tabs.attendees')}</TabsTrigger>
                    <TabsTrigger value="promotions">{t('tabs.promotions')}</TabsTrigger>
                    <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                    <Card><CardHeader><CardTitle>Dashboard</CardTitle></CardHeader><CardContent><p>Event dashboard will be here.</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="attendees">
                    <Card><CardHeader><CardTitle>Attendees</CardTitle></CardHeader><CardContent><p>Attendee management will be here.</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="promotions">
                    <div className="space-y-6">
                       <CouponCreationForm />
                       <ExistingCouponsList />
                    </div>
                </TabsContent>
                <TabsContent value="settings">
                    <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent><p>Event settings will be here.</p></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
