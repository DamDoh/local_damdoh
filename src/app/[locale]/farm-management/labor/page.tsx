
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, PlusCircle, ArrowLeft, Loader2, DollarSign, Clock, Eye, WifiOff, Save } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/api-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import type { Worker, WorkLog } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useOfflineSync } from '@/hooks/useOfflineSync';


export default function LaborManagementPage() {
    const t = useTranslations('farmManagement.laborPage');
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
    const [newWorkerName, setNewWorkerName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [hours, setHours] = useState<string>("");
    const [logDate, setLogDate] = useState<Date | undefined>(new Date());
    const [task, setTask] = useState("");

    const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
    const [unpaidLogs, setUnpaidLogs] = useState<WorkLog[]>([]);
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
    
    const { isOnline, addActionToQueue } = useOfflineSync();

    const getWorkers = useCallback(async () => {
        return await apiCall<{ workers: Worker[] }>('/labor/workers');
    }, []);

    const addWorker = useCallback(async (data: { name: string }) => {
        return await apiCall('/labor/workers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }, []);

    const logHours = useCallback(async (data: any) => {
        return await apiCall('/labor/log-hours', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }, []);

    const logPayment = useCallback(async (data: any) => {
        return await apiCall('/labor/log-payment', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }, []);

    const getUnpaidWorkLogs = useCallback(async (data: { workerId: string }) => {
        return await apiCall<{ workLogs: WorkLog[] }>(`/labor/unpaid-logs?workerId=${data.workerId}`);
    }, []);


    const fetchWorkers = useCallback(async () => {
        if (!user) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const result = await getWorkers();
            setWorkers(result.workers || []);
        } catch (error) {
            toast({ variant: "destructive", title: t('toast.errorTitle'), description: t('toast.fetchWorkersError') });
        } finally {
            setIsLoading(false);
        }
    }, [user, getWorkers, toast, t]);

    useEffect(() => {
        if (!authLoading) {
            fetchWorkers();
        }
    }, [authLoading, fetchWorkers]);

    const handleAddWorker = async () => {
        if (!newWorkerName.trim()) {
            toast({ variant: 'destructive', title: t('toast.nameRequired') });
            return;
        }
        setIsSubmitting(true);
        try {
            await addWorker({ name: newWorkerName });
            toast({ title: t('toast.workerAdded') });
            setNewWorkerName("");
            setIsAddWorkerOpen(false);
            fetchWorkers();
        } catch (error: any) {
            toast({ variant: "destructive", title: t('toast.errorTitle'), description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleLogHours = async () => {
        if (!selectedWorker || !hours || !logDate) return;
        setIsSubmitting(true);
        const payload = { workerId: selectedWorker.id, hours, date: logDate.toISOString(), taskDescription: task };
        try {
            if (isOnline) {
                await logHours(payload);
            } else {
                await addActionToQueue({ operation: 'logHours', collectionPath: 'work_logs', documentId: `worklog-${Date.now()}`, payload });
            }
            toast({ title: t('toast.hoursLogged') });
            setIsLogHoursOpen(false);
            setHours("");
            setTask("");
            fetchWorkers();
        } catch (error: any) {
             toast({ variant: "destructive", title: t('toast.errorTitle'), description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogPayment = async () => {
        if (!selectedWorker || !paymentAmount || !paymentDate) return;
        setIsSubmitting(true);
        const payload = {
            workerId: selectedWorker.id,
            amount: parseFloat(paymentAmount),
            date: paymentDate.toISOString(),
            currency: 'USD',
            workLogIds: selectedLogIds
        };
        try {
            if (isOnline) {
                await logPayment(payload);
            } else {
                await addActionToQueue({ operation: 'logPayment', collectionPath: 'payments', documentId: `payment-${Date.now()}`, payload });
            }
            toast({ title: t('toast.paymentLoggedTitle'), description: t('toast.paymentLoggedDescription') });
            setIsLogPaymentOpen(false);
            setPaymentAmount("");
            setSelectedLogIds([]);
            fetchWorkers();
        } catch(error: any) {
             toast({ variant: "destructive", title: t('toast.errorTitle'), description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenPaymentDialog = async (worker: Worker) => {
        setSelectedWorker(worker);
        setIsLogPaymentOpen(true);
        try {
            const result = await getUnpaidWorkLogs({ workerId: worker.id });
            setUnpaidLogs(result.workLogs || []);
        } catch (error) {
            console.error("Failed to fetch unpaid logs:", error);
            setUnpaidLogs([]);
        }
    };

    if (authLoading) return <div>{t('loading')}</div>;

    if (!user) return (
        <Card>
            <CardHeader><CardTitle>{t('signInPrompt.title')}</CardTitle></CardHeader>
            <CardContent><Button asChild><Link href="/auth/signin">{t('signInPrompt.button')}</Link></Button></CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
             <Link href="/farm-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6"/>{t('title')}</CardTitle>
                        <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/>{t('addWorker')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>{t('addWorker')}</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor="worker-name">{t('workerName')}</Label>
                                    <Input id="worker-name" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
                                </div>
                                <Button onClick={handleAddWorker} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{t('saveWorker')}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-40 w-full" /> : 
                    workers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workers.map(worker => (
                                <Card key={worker.id} className="flex flex-col">
                                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                        <Avatar><AvatarFallback>{worker.name.substring(0,1)}</AvatarFallback></Avatar>
                                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2 flex-grow">
                                        <p><strong>{t('hoursLogged')}:</strong> {worker.totalHoursLogged || 0}</p>
                                        <p><strong>{t('totalPaid')}:</strong> ${worker.totalPaid || 0}</p>
                                    </CardContent>
                                    <CardFooter className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedWorker(worker); setIsLogHoursOpen(true); }}><Clock className="mr-2 h-4 w-4"/>{t('logHours')}</Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenPaymentDialog(worker)}><DollarSign className="mr-2 h-4 w-4"/>{t('logPayment')}</Button>
                                        <Button asChild variant="ghost" className="col-span-2">
                                            <Link href={`/farm-management/labor/${worker.id}`}><Eye className="mr-2 h-4 w-4"/>{t('viewDetails')}</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-8">{t('noWorkers')}</p>}
                </CardContent>
            </Card>

            <Dialog open={isLogHoursOpen} onOpenChange={setIsLogHoursOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{t('logHoursFor')} {selectedWorker?.name}</DialogTitle></DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="hours">{t('hoursWorked')}</Label><Input id="hours" type="number" value={hours} onChange={e => setHours(e.target.value)} /></div>
                            <div>
                                <Label htmlFor="date">{t('date')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !logDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{logDate ? format(logDate, "PPP") : <span>{t('pickDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={logDate} onSelect={setLogDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                         <div className="space-y-2"><Label htmlFor="task">{t('taskDescription')}</Label><Input id="task" value={task} onChange={e => setTask(e.target.value)} /></div>
                    </div>
                     <DialogFooter>
                        <Button onClick={handleLogHours} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isOnline ? <Save className="mr-2 h-4 w-4"/> : <WifiOff className="mr-2 h-4 w-4"/>}
                            {isSubmitting ? t('savingButton') : (isOnline ? t('logButton') : t('logOfflineButton'))}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isLogPaymentOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedLogIds([]); setPaymentAmount(""); } setIsLogPaymentOpen(isOpen); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('logPaymentFor')} {selectedWorker?.name}</DialogTitle>
                        <DialogDescription>{t('paymentDialog.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                             <Label>{t('paymentDialog.unpaidLogs')}</Label>
                             <ScrollArea className="h-40 border rounded-md">
                                <div className="p-3 space-y-2">
                                    {unpaidLogs.length > 0 ? unpaidLogs.map(log => (
                                        <div key={log.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`log-${log.id}`} 
                                                checked={selectedLogIds.includes(log.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedLogIds(prev => checked ? [...prev, log.id] : prev.filter(id => id !== log.id))
                                                }}
                                            />
                                            <Label htmlFor={`log-${log.id}`} className="flex justify-between w-full text-sm">
                                                <span>{format(new Date(log.date), 'MMM d')}: {log.taskDescription}</span>
                                                <span className="font-bold">{log.hours} {t('paymentDialog.hoursSuffix')}</span>
                                            </Label>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground text-center py-4">{t('paymentDialog.noUnpaidLogs')}</p>}
                                </div>
                             </ScrollArea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="payment-amount">{t('amountPaid')}</Label><Input id="payment-amount" type="number" placeholder="e.g., 50.00" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
                            <div>
                                <Label htmlFor="payment-date">{t('date')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />{paymentDate ? format(paymentDate, "PPP") : <span>{t('pickDate')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                     <DialogFooter>
                        <Button onClick={handleLogPayment} disabled={isSubmitting || !paymentAmount}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isOnline ? <Save className="mr-2 h-4 w-4"/> : <WifiOff className="mr-2 h-4 w-4"/>}
                             {isSubmitting ? t('savingButton') : (isOnline ? t('logButton') : t('logOfflineButton'))}
                        </Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
