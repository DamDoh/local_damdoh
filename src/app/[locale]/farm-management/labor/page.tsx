
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, PlusCircle, ArrowLeft, Loader2, DollarSign, Calendar, Clock } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Worker {
  id: string;
  name: string;
  contactInfo?: string;
  payRate?: number;
  payRateUnit?: string;
  totalHoursLogged?: number;
  totalPaid?: number;
}

interface Log {
    id: string;
    date: string;
    hours?: number;
    taskDescription?: string;
    amount?: number;
    currency?: string;
    notes?: string;
}

export default function LaborManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // States for "Add Worker" dialog
    const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
    const [newWorkerName, setNewWorkerName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for "Log Hours" dialog
    const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [hours, setHours] = useState<string>("");
    const [logDate, setLogDate] = useState<Date | undefined>(new Date());
    const [task, setTask] = useState("");

    // States for "Log Payment" dialog
    const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

    const functions = getFunctions(firebaseApp);
    const getWorkersCallable = useMemo(() => httpsCallable(functions, 'getWorkers'), []);
    const addWorkerCallable = useMemo(() => httpsCallable(functions, 'addWorker'), []);
    const logHoursCallable = useMemo(() => httpsCallable(functions, 'logHours'), []);
    const logPaymentCallable = useMemo(() => httpsCallable(functions, 'logPayment'), []);

    const fetchWorkers = useCallback(async () => {
        if (!user) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const result = await getWorkersCallable();
            setWorkers((result.data as any).workers || []);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch workers data." });
        } finally {
            setIsLoading(false);
        }
    }, [user, getWorkersCallable, toast]);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const handleAddWorker = async () => {
        if (!newWorkerName.trim()) {
            toast({ variant: 'destructive', title: 'Name is required' });
            return;
        }
        setIsSubmitting(true);
        try {
            await addWorkerCallable({ name: newWorkerName });
            toast({ title: "Worker Added!" });
            setNewWorkerName("");
            setIsAddWorkerOpen(false);
            fetchWorkers();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleLogHours = async () => {
        if (!selectedWorker || !hours || !logDate) return;
        setIsSubmitting(true);
        try {
            await logHoursCallable({ workerId: selectedWorker.id, hours, date: logDate.toISOString(), taskDescription: task });
            toast({ title: "Hours Logged!" });
            setIsLogHoursOpen(false);
            setHours("");
            setTask("");
            fetchWorkers(); // Refetch to update totals
        } catch (error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogPayment = async () => {
        if (!selectedWorker || !paymentAmount || !paymentDate) return;
        setIsSubmitting(true);
        try {
            await logPaymentCallable({ workerId: selectedWorker.id, amount: paymentAmount, date: paymentDate.toISOString(), currency: 'USD' });
            toast({ title: "Payment Logged!", description: "An expense has been automatically added to your financials." });
            setIsLogPaymentOpen(false);
            setPaymentAmount("");
            fetchWorkers(); // Refetch to update totals
        } catch(error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <div>Loading...</div>;

    if (!user) return (
        <Card>
            <CardHeader><CardTitle>Please Sign In</CardTitle></CardHeader>
            <CardContent><Button asChild><Link href="/auth/signin">Sign In</Link></Button></CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Link href="/farm-management" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Farm Management Hub
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6"/>My People (Labor Management)</CardTitle>
                        <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/>Add Worker</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Worker</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Label htmlFor="worker-name">Worker's Name</Label>
                                    <Input id="worker-name" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
                                </div>
                                <Button onClick={handleAddWorker} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Save Worker</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardDescription>Keep track of your farm workers, their hours, and payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-40 w-full" /> : 
                    workers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workers.map(worker => (
                                <Card key={worker.id}>
                                    <CardHeader className="flex flex-row items-center gap-3">
                                        <Avatar><AvatarFallback>{worker.name.substring(0,1)}</AvatarFallback></Avatar>
                                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <p><strong>Hours Logged:</strong> {worker.totalHoursLogged || 0}</p>
                                        <p><strong>Total Paid:</strong> ${worker.totalPaid || 0}</p>
                                    </CardContent>
                                    <CardContent className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedWorker(worker); setIsLogHoursOpen(true); }}><Clock className="mr-2 h-4 w-4"/>Log Hours</Button>
                                        <Button variant="secondary" size="sm" onClick={() => { setSelectedWorker(worker); setIsLogPaymentOpen(true); }}><DollarSign className="mr-2 h-4 w-4"/>Log Payment</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-8">No workers added yet.</p>}
                </CardContent>
            </Card>

            {/* Log Hours Dialog */}
            <Dialog open={isLogHoursOpen} onOpenChange={setIsLogHoursOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Hours for {selectedWorker?.name}</DialogTitle></DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="hours">Hours Worked</Label>
                                <Input id="hours" type="number" value={hours} onChange={e => setHours(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !logDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{logDate ? format(logDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={logDate} onSelect={setLogDate} initialFocus /></PopoverContent></Popover>
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="task">Task Description (Optional)</Label>
                            <Input id="task" value={task} onChange={e => setTask(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleLogHours} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Log Hours</Button>
                </DialogContent>
            </Dialog>

             {/* Log Payment Dialog */}
            <Dialog open={isLogPaymentOpen} onOpenChange={setIsLogPaymentOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Log Payment for {selectedWorker?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="payment-amount">Amount Paid (USD)</Label>
                                <Input id="payment-amount" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="payment-date">Date</Label>
                                <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus /></PopoverContent></Popover>
                            </div>
                        </div>
                    </div>
                     <Button onClick={handleLogPayment} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Log Payment</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
