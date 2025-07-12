
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Key, Server, Rocket, Copy, EyeOff, Eye, PlusCircle, Trash2, Loader2, CheckCircle } from 'lucide-react';
import type { ApiKey, AgriTechInnovatorDashboardData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const functions = getFunctions(firebaseApp);

const ApiKeyRow = ({ apiKey, onRevoke }: { apiKey: ApiKey, onRevoke: (keyId: string) => void }) => {
    const t = useTranslations('AgriTechDashboard');
    const [isVisible, setIsVisible] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!apiKey.key) {
            toast({ title: t('toast.keyNotAvailable'), variant: "destructive" });
            return;
        }
        navigator.clipboard.writeText(apiKey.key);
        toast({ title: t('toast.apiKeyCopied') });
    };

    const handleRevokeClick = () => {
        setIsRevoking(true);
        onRevoke(apiKey.id);
    };

    return (
        <TableRow>
            <TableCell>
                <p className="font-semibold">{apiKey.description}</p>
                 <p className="font-mono text-xs text-muted-foreground">
                    {isVisible && apiKey.key ? apiKey.key : `${apiKey.keyPrefix}...`}
                 </p>
            </TableCell>
            <TableCell><Badge variant={apiKey.status === 'Active' ? 'default' : 'destructive'}>{apiKey.status}</Badge></TableCell>
            <TableCell><Badge variant={apiKey.environment === 'Sandbox' ? 'secondary' : 'outline'}>{apiKey.environment}</Badge></TableCell>
            <TableCell>{apiKey.createdAt ? format(new Date(apiKey.createdAt), "PPP") : 'N/A'}</TableCell>
            <TableCell className="text-right flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(!isVisible)} title={isVisible ? 'Hide key' : 'Show key'}>
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy key">
                    <Copy className="h-4 w-4" />
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Revoke key" disabled={apiKey.status === 'Revoked'}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>{t('revokeDialog.title')}</DialogTitle>
                        <DialogDescription>{t('revokeDialog.description')}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={(e) => (e.target as HTMLElement).closest('[role="dialog"]')?.click()}>{t('revokeDialog.cancel')}</Button>
                            <Button variant="destructive" onClick={handleRevokeClick} disabled={isRevoking}>
                                {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {t('revokeDialog.confirm')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </TableCell>
        </TableRow>
    );
};


export const AgriTechInnovatorDashboard = () => {
  const t = useTranslations('AgriTechDashboard');
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<AgriTechInnovatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'Sandbox' | 'Production'>('Sandbox');
  
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKey | null>(null);

  const generateApiKeyCallable = useMemo(() => httpsCallable(functions, 'generateApiKey'), []);
  const revokeApiKeyCallable = useMemo(() => httpsCallable(functions, 'revokeApiKey'), []);
  const getAgriTechInnovatorDashboardDataCallable = useMemo(() => httpsCallable(functions, 'getAgriTechInnovatorDashboardData'), []);

  const fetchDashboardData = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAgriTechInnovatorDashboardDataCallable();
        setDashboardData(result.data as AgriTechInnovatorDashboardData);
      } catch (err: any) {
        console.error("Error fetching Agri-Tech dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
  }, [getAgriTechInnovatorDashboardDataCallable]);
  
  useEffect(() => {
      fetchDashboardData();
  }, [fetchDashboardData]);

  const handleGenerateKey = async () => {
      if (!newKeyDescription.trim()) {
          toast({ title: t('toast.descriptionRequired'), variant: 'destructive' });
          return;
      }
      setIsSubmitting(true);
      try {
          const result = await generateApiKeyCallable({ description: newKeyDescription, environment: newKeyEnv });
          const newKeyData = result.data as ApiKey;
          setNewlyGeneratedKey(newKeyData);
          setNewKeyDescription('');
          fetchDashboardData();
      } catch (error: any) {
          toast({ title: t('toast.keyGeneratedError'), description: error.message, variant: 'destructive' });
      } finally {
          setIsSubmitting(false);
          setIsGenerateModalOpen(false);
      }
  };
  
  const handleRevokeKey = async (keyId: string) => {
       try {
          await revokeApiKeyCallable({ keyId });
          toast({ title: t('toast.keyRevokedSuccess') });
          document.querySelector('[role="dialog"] [aria-label="Close"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          fetchDashboardData();
      } catch (error: any) {
          toast({ title: t('toast.keyRevokedError'), description: error.message, variant: 'destructive' });
      }
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
      return (
           <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No dashboard data available.</p>
                </CardContent>
           </Card>
      );
  }

  const { sandboxStatus, integrationProjects, apiKeys } = dashboardData;

  const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return 'text-green-500';
            case 'Degraded': return 'text-yellow-500';
            case 'Offline': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Server className="h-4 w-4"/>{t('sandboxTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{t('statusLabel')}: <span className={getStatusColor(sandboxStatus.status)}>{sandboxStatus.status}</span></p>
            <p className="text-xs text-muted-foreground">{t('lastResetLabel')} {formatDistanceToNow(new Date(sandboxStatus.lastReset), { addSuffix: true })}</p>
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm">{t('accessDocsButton')}</Button>
           </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4"/>{t('integrationsTitle')}</CardTitle>
          </CardHeader>
           <CardContent>
            <p className="text-lg font-bold">{(integrationProjects || []).length} {t('activeProjects')}</p>
            <p className="text-xs text-muted-foreground">{t('integrationsDescription')}</p>
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm">{t('proposeIntegrationButton')}</Button>
           </CardFooter>
        </Card>
      </div>

       <Card>
           <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4"/>{t('apiKeysTitle')}</CardTitle>
                    <CardDescription>{t('apiKeysDescription')}</CardDescription>
                </div>
                <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>{t('generateNewKeyButton')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('generateNewKeyButton')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="key-desc" className="text-right">Description</Label>
                                <Input id="key-desc" value={newKeyDescription} onChange={(e) => setNewKeyDescription(e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="key-env" className="text-right">Environment</Label>
                                <Select value={newKeyEnv} onValueChange={(val) => setNewKeyEnv(val as any)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select environment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sandbox">Sandbox</SelectItem>
                                        <SelectItem value="Production">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>{t('revokeDialog.cancel')}</Button>
                            <Button onClick={handleGenerateKey} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {t('generateButton')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
           </CardHeader>
           <CardContent>
             {(apiKeys || []).length > 0 ? (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>{t('table.key')}</TableHead>
                     <TableHead>{t('table.status')}</TableHead>
                     <TableHead>{t('table.environment')}</TableHead>
                     <TableHead>{t('table.created')}</TableHead>
                     <TableHead className="text-right">{t('table.actions')}</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {(apiKeys || []).map((key) => (
                      <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevokeKey} />
                   ))}
                 </TableBody>
               </Table>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">{t('noApiKeys')}</p>
             )}
           </CardContent>
         </Card>
    </div>

     <Dialog open={!!newlyGeneratedKey} onOpenChange={(open) => !open && setNewlyGeneratedKey(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-green-600 flex items-center gap-2"><CheckCircle className="h-5 w-5"/>{t('newKeyModal.title')}</DialogTitle>
                <DialogDescription>{t('newKeyModal.description')}</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-muted rounded-md font-mono break-all text-sm relative">
                {newlyGeneratedKey?.key}
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => {
                    navigator.clipboard.writeText(newlyGeneratedKey?.key || '');
                    toast({ title: t('toast.apiKeyCopied') });
                }}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <DialogFooter>
                <Button onClick={() => setNewlyGeneratedKey(null)}>{t('newKeyModal.closeButton')}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-72 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
    </div>
);
