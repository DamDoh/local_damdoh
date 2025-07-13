
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ScanLine, UserCheck, AlertCircle, Users, UserPlus, Trash2, Search, ArrowLeft, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useFormatter, useTranslations } from "next-intl";

const QrScanner = dynamic(() => import('@/components/QrScanner').then(mod => mod.QrScanner), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin"/></div>
});

interface Attendee {
    id: string;
    displayName: string;
    email: string;
    registeredAt: string;
    checkedIn: boolean;
    checkedInAt: string | null;
}

interface Coupon {
    id: string;
    code: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    usageCount: number;
    usageLimit: number | null;
    expiresAt: string | null;
}


interface StaffMember {
    id: string;
    displayName?: string;
    avatarUrl?: string;
}

const CheckInTab = ({ eventId, eventName }: { eventId: string, eventName: string }) => {
    const t = useTranslations('AgriEvents.manage.checkin');
    const [isScanning, setIsScanning] = useState(false);
    const [checkInResult, setCheckInResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { toast } = useToast();
    const checkInCallable = useMemo(() => httpsCallable(functions, 'checkInAttendee'), []);

    const handleScanSuccess = async (decodedText: string) => {
        setIsScanning(false);
        setIsProcessing(true);
        setCheckInResult(null);

        try {
            if (!decodedText.startsWith('damdoh:checkin')) {
                throw new Error(t('error.invalidCode'));
            }

            const urlParams = new URLSearchParams(decodedText.split('?')[1]);
            const scannedEventId = urlParams.get('eventId');
            const attendeeUid = urlParams.get('userId');

            if (scannedEventId !== eventId) {
                throw new Error(t('error.wrongEvent'));
            }
            
            if (!attendeeUid) {
                throw new Error(t('error.noUserId'));
            }
            
            const result = await checkInCallable({ eventId, attendeeUid });
            const data = result.data as { success: boolean, message: string };
            
            if (data.success) {
                setCheckInResult({ type: 'success', message: data.message });
                toast({ title: t('toast.success.title'), description: data.message });
            } else {
                 throw new Error(data.message || t('error.failUnknown'));
            }
        } catch (error: any) {
             const message = error.message;
            setCheckInResult({ type: 'error', message: message });
            toast({ variant: "destructive", title: t('toast.fail.title'), description: message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleScanFailure = (error: string) => {
        setIsScanning(false);
        toast({ variant: "destructive", title: t('toast.scanFail.title'), description: t('toast.scanFail.description') });
    };

    return (
        <>
        {isScanning && ( <QrScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} onClose={() => setIsScanning(false)} /> )}
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Button size="lg" onClick={() => setIsScanning(true)} disabled={isProcessing}>
                    <ScanLine className="mr-2 h-6 w-6" />
                    {t('scanButton')}
                </Button>

                {isProcessing && <div className="flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> {t('verifying')}</div>}
                
                {checkInResult && (
                    <Alert variant={checkInResult.type === 'error' ? 'destructive' : 'default'} className="text-left">
                        {checkInResult.type === 'success' ? <UserCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertTitle>{checkInResult.type === 'success' ? t('success') : t('errorTitle')}</AlertTitle>
                        <AlertDescription>{checkInResult.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
        </>
    );
};

const AttendeesTab = ({ eventId }: { eventId: string }) => {
    const t = useTranslations('AgriEvents.manage.attendees');
    const format = useFormatter();
    const { toast } = useToast();
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAttendeesCallable = useMemo(() => httpsCallable(functions, 'getEventAttendees'), []);

    useEffect(() => {
        if (!eventId) return;
        const fetchAttendees = async () => {
            setIsLoading(true);
            try {
                const result = await getAttendeesCallable({ eventId });
                setAttendees((result.data as any)?.attendees || []);
            } catch (error) {
                toast({ variant: "destructive", title: t('error'), description: t('fetchError') });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendees();
    }, [eventId, getAttendeesCallable, toast, t]);
    
     const handleDownloadCsv = () => {
        if (attendees.length === 0) {
            toast({ title: t('toast.noAttendees') });
            return;
        }

        const headers = ["displayName", "email", "registeredAt", "checkedIn", "checkedInAt"];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + attendees.map(e => headers.map(header => `"${e[header as keyof Attendee]}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `event_attendees_${eventId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('title')} ({attendees.length})</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </div>
                <Button onClick={handleDownloadCsv} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadCsv')}
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> :
                attendees.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.attendee')}</TableHead>
                                <TableHead>{t('table.email')}</TableHead>
                                <TableHead>{t('table.registeredOn')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.checkedInAt')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendees.map(attendee => (
                                <TableRow key={attendee.id}>
                                    <TableCell className="font-medium">{attendee.displayName}</TableCell>
                                    <TableCell>{attendee.email}</TableCell>
                                    <TableCell>{format.dateTime(new Date(attendee.registeredAt), {dateStyle: 'medium'})}</TableCell>
                                    <TableCell>
                                        <Badge variant={attendee.checkedIn ? "default" : "secondary"}>
                                            {attendee.checkedIn ? t('status.checkedIn') : t('status.registered')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{attendee.checkedInAt ? format.dateTime(new Date(attendee.checkedInAt), {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-8">{t('noAttendees')}</p>
                )}
            </CardContent>
        </Card>
    );
};

const StaffManagementTab = ({ eventId }: { eventId: string }) => {
    const t = useTranslations('AgriEvents.manage.staff');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [currentStaff, setCurrentStaff] = useState<StaffMember[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);

    const searchUsersCallable = useMemo(() => httpsCallable(functions, 'searchUsersForStaffing'), []);
    const addStaffCallable = useMemo(() => httpsCallable(functions, 'addEventStaff'), []);
    const getStaffCallable = useMemo(() => httpsCallable(functions, 'getEventStaff'), []);
    const removeStaffCallable = useMemo(() => httpsCallable(functions, 'removeEventStaff'), []);
    
    const fetchStaff = useCallback(async () => {
        setIsLoadingStaff(true);
        try {
            const result = await getStaffCallable({ eventId });
            setCurrentStaff((result.data as any)?.staff || []);
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.fetchStaffError') });
        } finally {
            setIsLoadingStaff(false);
        }
    }, [eventId, getStaffCallable, toast, t]);
    
    useEffect(() => {
        if (eventId) fetchStaff();
    }, [eventId, fetchStaff]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.length < 3) {
            toast({ title: t('toast.searchLengthError') });
            return;
        }
        setIsSearching(true);
        try {
            const result = await searchUsersCallable({ query: searchQuery });
            setSearchResults((result.data as any)?.users || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.searchFailed'), description: error.message });
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleAddStaff = async (staffMember: UserProfile) => {
        try {
            await addStaffCallable({ 
                eventId, 
                staffUserId: staffMember.id,
                staffDisplayName: staffMember.displayName,
                staffAvatarUrl: staffMember.avatarUrl
            });
            toast({ title: t('toast.success'), description: t('toast.addSuccess', { name: staffMember.displayName })});
            fetchStaff(); // Refresh the list
            setSearchResults([]); // Clear search results
            setSearchQuery('');
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.addFailed'), description: error.message });
        }
    };
    
    const handleRemoveStaff = async (staffMember: StaffMember) => {
        try {
            await removeStaffCallable({ eventId, staffUserId: staffMember.id });
            toast({ title: t('toast.success'), description: t('toast.removeSuccess', { name: staffMember.displayName })});
            fetchStaff();
        } catch(error: any) {
             toast({ variant: 'destructive', title: t('toast.removeFailed'), description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>{t('title')}</CardTitle><CardDescription>{t('description')}</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">{t('addTitle')}</h3>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <Button type="submit" disabled={isSearching}>{isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}</Button>
                    </form>
                    <div className="mt-2 space-y-2">
                        {searchResults.map(res => (
                            <div key={res.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8"><AvatarImage src={res.avatarUrl} /><AvatarFallback>{res.displayName?.substring(0,1)}</AvatarFallback></Avatar>
                                    <div><p className="text-sm font-medium">{res.displayName}</p><p className="text-xs text-muted-foreground">{res.email}</p></div>
                                </div>
                                <Button size="sm" onClick={() => handleAddStaff(res)}><UserPlus className="h-4 w-4 mr-2"/>{t('addButton')}</Button>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium mb-2">{t('currentTitle')} ({currentStaff.length})</h3>
                    {isLoadingStaff ? <Skeleton className="h-24 w-full" /> : 
                     currentStaff.length > 0 ? (
                        <div className="space-y-2">
                             {currentStaff.map(staff => (
                                <div key={staff.id} className="flex items-center justify-between p-2 border rounded-md">
                                     <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8"><AvatarImage src={staff.avatarUrl} /><AvatarFallback>{staff.displayName?.substring(0,1)}</AvatarFallback></Avatar>
                                        <p className="text-sm font-medium">{staff.displayName}</p>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveStaff(staff)}><Trash2 className="h-4 w-4 mr-2"/>{t('removeButton')}</Button>
                                </div>
                             ))}
                        </div>
                     ) : <p className="text-sm text-muted-foreground text-center py-4">{t('noStaff')}</p>
                    }
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function ManageEventPage() {
    const t = useTranslations('AgriEvents.manage');
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const { user, loading } = useAuth();
    
    // In a real app, we would fetch item details to get the name and verify ownership
    const eventName = "Agricultural Event"; 

    if (loading) {
        return <div>{t('loading')}</div>;
    }
    
    if (!user) {
        router.push("/auth/signin");
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
             <Button asChild variant="outline" className="mb-4">
                <Link href={`/agri-events/${eventId}`}><ArrowLeft className="mr-2 h-4 w-4" />{t('backLink')}</Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground mb-6">{eventName}</p>
            <Tabs defaultValue="check-in" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="check-in">{t('tabs.checkin')}</TabsTrigger>
                    <TabsTrigger value="attendees">{t('tabs.attendees')}</TabsTrigger>
                    <TabsTrigger value="staff">{t('tabs.staff')}</TabsTrigger>
                    <TabsTrigger value="coupons">{t('tabs.coupons')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="check-in" className="mt-4">
                    <CheckInTab eventId={eventId} eventName={eventName} />
                </TabsContent>
                <TabsContent value="attendees" className="mt-4">
                    <AttendeesTab eventId={eventId} />
                </TabsContent>
                 <TabsContent value="staff" className="mt-4">
                    <StaffManagementTab eventId={eventId} />
                </TabsContent>
                <TabsContent value="coupons" className="mt-4">
                    <p>Coupons Management coming soon...</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
