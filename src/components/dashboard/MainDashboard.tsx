
"use client";

import React, { Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { FeedItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/hubs/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import { PageSkeleton } from '@/components/Skeletons';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-utils";
import { httpsCallable } from 'firebase/functions';
import { functions, app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { FeedItemCard } from '@/components/dashboard/FeedItemCard';
import { collection, query, orderBy, onSnapshot, getFirestore, limit } from "firebase/firestore";
import { uploadFileAndGetURL } from '@/lib/storage-utils';
import { useTranslations } from 'next-intl';
import { STAKEHOLDER_ROLES } from '@/lib/constants';
import { Button } from '../ui/button';
import { Link } from '@/navigation';
import { Edit } from 'lucide-react';

// Hub Components
import { AgroExportDashboard } from '@/components/dashboard/hubs/AgroExportDashboard';
import { AgroTourismDashboard } from '@/components/dashboard/hubs/AgroTourismDashboard';
import { AgronomistDashboard } from '@/components/dashboard/hubs/AgronomistDashboard';
import { BuyerDashboard } from '@/components/dashboard/hubs/BuyerDashboard';
import { CertificationBodyDashboard } from '@/components/dashboard/hubs/CertificationBodyDashboard';
import { CooperativeDashboard } from '@/components/dashboard/hubs/CooperativeDashboard';
import { CrowdfunderDashboard } from '@/components/dashboard/hubs/CrowdfunderDashboard';
import { EnergyProviderDashboard } from '@/components/dashboard/hubs/EnergyProviderDashboard';
import { EquipmentSupplierDashboard } from '@/components/dashboard/hubs/EquipmentSupplierDashboard';
import { FarmerDashboard } from '@/components/dashboard/hubs/FarmerDashboard';
import { FieldAgentDashboard } from '@/components/dashboard/hubs/FieldAgentDashboard';
import { FiDashboard } from '@/components/dashboard/hubs/FiDashboard';
import { InputSupplierDashboard } from '@/components/dashboard/hubs/InputSupplierDashboard';
import { InsuranceProviderDashboard } from '@/components/dashboard/hubs/InsuranceProviderDashboard';
import { PackagingSupplierDashboard } from '@/components/dashboard/hubs/PackagingSupplierDashboard';
import { QaDashboard } from '@/components/dashboard/hubs/QaDashboard';
import { RegulatorDashboard } from '@/components/dashboard/hubs/RegulatorDashboard';
import { ResearcherDashboard } from '@/components/dashboard/hubs/ResearcherDashboard';
import { WasteManagementDashboard } from '@/components/dashboard/hubs/WasteManagementDashboard';
import { AgriTechInnovatorDashboard } from './hubs/AgriTechInnovatorDashboard';
import { OperationsDashboard } from './hubs/OperationsDashboard';
import { LogisticsDashboard } from './hubs/processing-logistics/LogisticsDashboard';
import { ProcessingUnitDashboard } from './hubs/processing-logistics/ProcessingUnitDashboard';
import { WarehouseDashboard } from './hubs/processing-logistics/WarehouseDashboard';


const { useState, useEffect, useMemo } = React;
const db = getFirestore(firebaseApp);

const HubComponentMap: { [key in typeof STAKEHOLDER_ROLES[number]]?: React.ComponentType } = {
    'Farmer': FarmerDashboard,
    'Agricultural Cooperative': CooperativeDashboard,
    'Field Agent/Agronomist (DamDoh Internal)': FieldAgentDashboard,
    'Operations/Logistics Team (DamDoh Internal)': OperationsDashboard,
    'Quality Assurance Team (DamDoh Internal)': QaDashboard,
    'Processing & Packaging Unit': ProcessingUnitDashboard,
    'Buyer (Restaurant, Supermarket, Exporter)': BuyerDashboard,
    'Input Supplier (Seed, Fertilizer, Pesticide)': InputSupplierDashboard,
    'Equipment Supplier (Sales of Machinery/IoT)': EquipmentSupplierDashboard,
    'Financial Institution (Micro-finance/Loans)': FiDashboard,
    'Government Regulator/Auditor': RegulatorDashboard,
    'Certification Body (Organic, Fair Trade etc.)': CertificationBodyDashboard,
    'Researcher/Academic': ResearcherDashboard,
    'Logistics Partner (Third-Party Transporter)': LogisticsDashboard,
    'Storage/Warehouse Facility': WarehouseDashboard,
    'Agronomy Expert/Consultant (External)': AgronomistDashboard,
    'Agro-Tourism Operator': AgroTourismDashboard,
    'Energy Solutions Provider (Solar, Biogas)': EnergyProviderDashboard,
    'Agro-Export Facilitator/Customs Broker': AgroExportDashboard,
    'Agri-Tech Innovator/Developer': AgriTechInnovatorDashboard,
    'Waste Management & Compost Facility': WasteManagementDashboard,
    'Crowdfunder (Impact Investor, Individual)': CrowdfunderDashboard,
    'Insurance Provider': InsuranceProviderDashboard,
    'Packaging Supplier': PackagingSupplierDashboard
};


function MainContent() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth(); // Use the global context
  const t = useTranslations('MainDashboard');
  
  const createPostCallable = httpsCallable(functions, 'community-createFeedPost');
  const likePostCallable = httpsCallable(functions, 'community-likePost');
  const addCommentCallable = httpsCallable(functions, 'community-addComment');
  const deletePostCallable = httpsCallable(functions, 'community-deletePost');
  
  useEffect(() => {
    let unsubscribeFeed: () => void = () => {};

    setIsLoadingFeed(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    unsubscribeFeed = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              timestamp: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
          } as FeedItem
        });
        setFeedItems(posts);
        setIsLoadingFeed(false);
    }, (error) => {
        console.error("Error fetching real-time feed:", error);
        toast({
            title: t('feedError.title'),
            description: t('feedError.description'),
            variant: "destructive"
        });
        setIsLoadingFeed(false);
    });
    
    return () => unsubscribeFeed();
  }, [toast, t]);


  const handleCreatePost = async (content: string, media?: File, pollData?: { text: string }[]) => {
    if (!user) {
      toast({ title: t('postError.auth'), variant: "destructive" });
      return;
    }
    
    try {
      let imageUrl: string | undefined = undefined;
      let dataAiHint: string | undefined = undefined;
      if (media) {
        toast({ title: t('uploadingMedia') });
        imageUrl = await uploadFileAndGetURL(media, `feed-posts/${user.uid}`);
        toast({ title: t('uploadComplete') });
      }

      await createPostCallable({ content, pollOptions: pollData, imageUrl, dataAiHint });
      toast({ title: t('postSuccess.title'), description: t('postSuccess.description') });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: t('postError.fail'), variant: "destructive" });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
        toast({ title: t('likeError.auth'), variant: "destructive" });
        return;
    }
    try {
      await likePostCallable({ postId });
    } catch(error) {
      console.error("Error liking post:", error);
      toast({ title: t('likeError.fail'), variant: "destructive" });
    }
  };
  
  const handleCommentOnPost = async (postId: string, commentText: string) => {
     if (!user) {
        toast({ title: t('commentError.auth'), variant: "destructive" });
        return;
    }
     try {
        await addCommentCallable({ postId, content: commentText });
        toast({ title: t('commentSuccess') });
     } catch(error) {
         console.error("Error adding comment:", error);
         toast({ title: t('commentError.fail'), variant: "destructive" });
     }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) {
        toast({ title: t('deleteError.auth'), variant: "destructive" });
        return;
    }

    try {
        await deletePostCallable({ postId });
        toast({ title: t('deleteSuccess.title'), description: t('deleteSuccess.description') });
    } catch (error) {
        console.error("Error deleting post:", error);
        toast({ title: t('deleteError.fail'), variant: "destructive" });
    }
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      );
    }
    
    // Check if the profile is incomplete (using a simple heuristic for now)
    const isProfileIncomplete = profile && (!profile.profileSummary || profile.profileSummary.includes("Just joined") || !profile.location);

    if (isProfileIncomplete) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>{t('profileCompletion.title')}</CardTitle>
                    <CardDescription>{t('profileCompletion.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/profiles/me/edit">
                            <Edit className="mr-2 h-4 w-4" />
                            {t('profileCompletion.button')}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
  
    // Use the stable key from the profile for logic
    const HubComponent = profile ? HubComponentMap[profile.primaryRole as keyof typeof HubComponentMap] : null;
    if (HubComponent) {
      return <HubComponent />;
    }

    // Default feed view if no specific hub component
    if (isLoadingFeed) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      );
    }
    
    return feedItems && feedItems.length > 0 ? (
      feedItems.map(item => (
        <FeedItemCard 
          key={item.id} 
          item={item} 
          onDeletePost={handleDeletePost}
          onLike={handleLikePost}
          onComment={handleCommentOnPost}
        />
      ))
    ) : (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-10">{t('noActivity')}</p>
        </CardContent>
      </Card>
    );
  };

  if (authLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-3 lg:col-span-2">
        <DashboardLeftSidebar />
      </div>
      <div className="md:col-span-6 lg:col-span-7 space-y-6">
        {user && <StartPost onCreatePost={handleCreatePost} />}
        {renderContent()}
      </div>
      <div className="hidden lg:block md:col-span-3">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}


export function MainDashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MainContent />
    </Suspense>
  );
}
