"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { locales, localeNames, languageMetadata } from '@/i18n-config';

interface TranslationEntry {
  key: string;
  microservice: string;
  translations: Record<string, string>;
  lastModified: Date;
  modifiedBy: string;
  status: 'complete' | 'partial' | 'missing';
}

interface TranslationStats {
  totalKeys: number;
  completeTranslations: number;
  partialTranslations: number;
  missingTranslations: number;
  completionRate: number;
}

export function TranslationManager() {
  const t = useTranslations('admin');
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [selectedMicroservice, setSelectedMicroservice] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TranslationStats>({
    totalKeys: 0,
    completeTranslations: 0,
    partialTranslations: 0,
    missingTranslations: 0,
    completionRate: 0
  });

  const microservices = [
    'auth', 'common', 'dashboard', 'farm-management',
    'marketplace', 'financial', 'traceability', 'network',
    'knowledge-hub', 'forums', 'notifications', 'search',
    'analytics', 'compliance', 'sustainability'
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTranslations: TranslationEntry[] = [
      {
        key: 'navigation.home',
        microservice: 'common',
        translations: {
          en: 'Home',
          fr: 'Accueil',
          de: 'Startseite',
          es: 'Inicio',
          ar: 'الرئيسية'
        },
        lastModified: new Date('2024-01-15'),
        modifiedBy: 'admin',
        status: 'complete'
      },
      {
        key: 'farmManagement.title',
        microservice: 'farm-management',
        translations: {
          en: 'Farm Management',
          fr: 'Gestion de la Ferme',
          de: 'Betriebsführung',
          es: 'Gestión de la Granja'
        },
        lastModified: new Date('2024-01-14'),
        modifiedBy: 'translator',
        status: 'partial'
      },
      {
        key: 'marketplace.listings.title',
        microservice: 'marketplace',
        translations: {
          en: 'Product Listings',
          fr: 'Annonces de Produits',
          de: 'Produktangebote'
        },
        lastModified: new Date('2024-01-13'),
        modifiedBy: 'admin',
        status: 'partial'
      }
    ];

    setTranslations(mockTranslations);
    calculateStats(mockTranslations);
    setIsLoading(false);
  }, []);

  const calculateStats = (translationData: TranslationEntry[]) => {
    const totalKeys = translationData.length;
    let complete = 0;
    let partial = 0;
    let missing = 0;

    translationData.forEach(entry => {
      const translationCount = Object.keys(entry.translations).length;
      if (translationCount === locales.length) {
        complete++;
      } else if (translationCount > 0) {
        partial++;
      } else {
        missing++;
      }
    });

    const completionRate = totalKeys > 0 ? ((complete + partial * 0.5) / totalKeys) * 100 : 0;

    setStats({
      totalKeys,
      completeTranslations: complete,
      partialTranslations: partial,
      missingTranslations: missing,
      completionRate
    });
  };

  const filteredTranslations = useMemo(() => {
    return translations.filter(entry => {
      const matchesMicroservice = selectedMicroservice === 'all' || entry.microservice === selectedMicroservice;
      const matchesLanguage = selectedLanguage === 'all' ||
        (selectedLanguage in entry.translations) ||
        (entry.translations[selectedLanguage] === undefined);
      const matchesSearch = searchQuery === '' ||
        entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(entry.translations).some(value =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesMicroservice && matchesLanguage && matchesSearch;
    });
  }, [translations, selectedMicroservice, selectedLanguage, searchQuery]);

  const handleEdit = (entry: TranslationEntry) => {
    setEditingKey(entry.key);
    setEditValues({ ...entry.translations });
  };

  const handleSave = () => {
    if (!editingKey) return;

    setTranslations(prev => prev.map(entry =>
      entry.key === editingKey
        ? {
            ...entry,
            translations: editValues,
            lastModified: new Date(),
            modifiedBy: 'admin',
            status: Object.keys(editValues).length === locales.length ? 'complete' : 'partial'
          }
        : entry
    ));

    setEditingKey(null);
    setEditValues({});
    calculateStats(translations);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValues({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Missing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Translation Management</h1>
          <p className="text-gray-600 mt-1">Manage translations across all microservices and languages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Translation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completeTranslations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partial</p>
                <p className="text-2xl font-bold text-gray-900">{stats.partialTranslations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className={`text-2xl font-bold ${getCompletionColor(stats.completionRate)}`}>
                  {stats.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search translations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedMicroservice} onValueChange={setSelectedMicroservice}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Microservices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Microservices</SelectItem>
                {microservices.map(service => (
                  <SelectItem key={service} value={service}>
                    {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {locales.map(locale => (
                  <SelectItem key={locale} value={locale}>
                    {localeNames[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Keys ({filteredTranslations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Microservice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranslations.map((entry) => (
                <TableRow key={entry.key}>
                  <TableCell className="font-mono text-sm">{entry.key}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.microservice}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {locales.slice(0, 5).map(locale => (
                        <span
                          key={locale}
                          className={`text-xs px-1 py-0.5 rounded ${
                            entry.translations[locale]
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          title={localeNames[locale]}
                        >
                          {locale.toUpperCase()}
                        </span>
                      ))}
                      {locales.length > 5 && (
                        <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800">
                          +{locales.length - 5}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {entry.lastModified.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        disabled={editingKey === entry.key}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Translation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this translation key? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingKey !== null} onOpenChange={() => handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Translation: {editingKey}</DialogTitle>
            <DialogDescription>
              Update translations for all supported languages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locales.map(locale => (
              <div key={locale} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>{localeNames[locale]}</span>
                  <span className="text-xs text-gray-500">({locale})</span>
                </label>
                <Textarea
                  value={editValues[locale] || ''}
                  onChange={(e) => setEditValues(prev => ({
                    ...prev,
                    [locale]: e.target.value
                  }))}
                  placeholder={`Enter translation for ${localeNames[locale]}...`}
                  className="min-h-20"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}