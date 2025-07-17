
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FileText, Loader2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';

interface GeneratedReport {
  id: string;
  reportType: string;
  generatedForRef: { path: string };
  generatedAt: { toDate: () => Date };
  status: string;
  reportPeriod: {
    startDate: { toDate: () => Date };
    endDate: { toDate: () => Date };
  }
}

interface UserSearchResult {
    id: string;
    displayName: string;
}

const functionsCallable = {
  generateRegulatoryReport: httpsCallable(functions, 'generateRegulatoryReport'),
  getGeneratedReports: httpsCallable(functions, 'getGeneratedReports'),
  searchUsersForStaffing: httpsCallable(functions, 'searchUsersForStaffing'),
};

export default function ReportsManagementPage() {
  const t = useTranslations('admin.reports');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form State
  const [reportType, setReportType] = useState('VTI_EVENTS_SUMMARY');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [debouncedUserSearchQuery] = useDebounce(userSearchQuery, 500);
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await functionsCallable.getGeneratedReports();
      setReports((result.data as any).reports || []);
    } catch (error: any) {
      toast({ title: t('toast.loadErrorTitle'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (debouncedUserSearchQuery.length < 3) {
      setUserSearchResults([]);
      return;
    }
    const search = async () => {
      setIsSearchingUsers(true);
      try {
        const result = await functionsCallable.searchUsersForStaffing({ query: debouncedUserSearchQuery });
        setUserSearchResults((result.data as any).users || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearchingUsers(false);
      }
    };
    search();
  }, [debouncedUserSearchQuery]);

  const handleGenerateReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reportType || !targetUserId || !dateRange?.from || !dateRange?.to) {
      toast({ title: t('toast.formIncompleteTitle'), description: t('toast.formIncompleteDescription'), variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        reportType,
        userId: targetUserId,
        reportPeriod: {
          startDate: dateRange.from.getTime(),
          endDate: dateRange.to.getTime(),
        },
      };
      await functionsCallable.generateRegulatoryReport(payload);
      toast({ title: t('toast.generateSuccessTitle'), description: t('toast.generateSuccessDescription') });
      setTargetUserId('');
      setUserSearchQuery('');
      setDateRange(undefined);
      fetchReports();
    } catch (error: any) {
      toast({ title: t('toast.generateErrorTitle'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('generate.title')}</CardTitle>
          <CardDescription>{t('generate.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="report-type">{t('generate.reportTypeLabel')}</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VTI_EVENTS_SUMMARY">{t('generate.reportTypeVti')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-search">{t('generate.targetUserLabel')}</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="user-search"
                    placeholder={t('generate.userSearchPlaceholder')}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                    autoComplete="off"
                  />
                  {isSearchingUsers && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {userSearchResults.length > 0 && (
                   <div className="p-2 border rounded-md max-h-40 overflow-y-auto absolute bg-background z-10 w-full shadow-md">
                     {userSearchResults.map(user => (
                       <div key={user.id} className="p-2 hover:bg-accent rounded-md cursor-pointer" onClick={() => { setTargetUserId(user.id); setUserSearchQuery(user.displayName); setTargetUserName(user.displayName); setUserSearchResults([]); }}>
                         <p className="text-sm font-medium">{user.displayName}</p>
                       </div>
                     ))}
                   </div>
                )}
                {targetUserId && <p className="text-xs text-green-600">Selected: {targetUserName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t('generate.dateRangeLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t('generate.datePlaceholder')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FileText className="mr-2 h-4 w-4"/>
              {t('generate.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('list.table.reportType')}</TableHead>
                  <TableHead>{t('list.table.generatedFor')}</TableHead>
                  <TableHead>{t('list.table.date')}</TableHead>
                  <TableHead>{t('list.table.status')}</TableHead>
                  <TableHead className="text-right">{t('list.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{t(`generate.reportTypeVti`)}</TableCell>
                      <TableCell>{report.generatedForRef.path.split('/')[1]}</TableCell>
                      <TableCell>{report.generatedAt ? format(report.generatedAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                      <TableCell><Badge>{report.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">{t('list.viewButton')}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('list.noReports')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
