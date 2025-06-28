
"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeedItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { FeedItemCard } from '@/components/dashboard/FeedItemCard';
import { doc, getDoc, getFirestore } from "firebase/firestore";

// Hub Components
import { FarmerDashboard } from '@/components/dashboard/hubs/FarmerDashboard';
import { BuyerDashboard } from '@/components/dashboard/hubs/BuyerDashboard';
import { LogisticsDashboard } from '@/components/dashboard/hubs/LogisticsDashboard';
import { FiDashboard } from '@/components/dashboard/hubs/FiDashboard';
import { InputSupplierDashboard } from '@/components/dashboard/hubs/InputSupplierDashboard';
import { FieldAgentDashboard } from '@/components/dashboard/hubs/FieldAgentDashboard';
import { AgroExportDashboard } from '@/components/dashboard/hubs/AgroExportDashboard';
import { PackagingSupplierDashboard } from '@/components/dashboard/hubs/PackagingSupplierDashboard';
import { RegulatorDashboard } from '@/components/dashboard/hubs/RegulatorDashboard';
import { EnergyProviderDashboard } from '@/components/dashboard/hubs/EnergyProviderDashboard';
import { QaDashboard } from '@/components/dashboard/hubs/QaDashboard';
import { CertificationBodyDashboard } from '@/components/dashboard/hubs/CertificationBodyDashboard';
import { ResearcherDashboard } from '@/components/dashboard/hubs/ResearcherDashboard';
import { AgronomistDashboard } from '@/components/dashboard/hubs/AgronomistDashboard';
import { AgroTourismDashboard } from '@/components/dashboard/hubs/AgroTourismDashboard';
import { InsuranceProviderDashboard } from '@/components/dashboard/hubs/InsuranceProviderDashboard';
import { ProcessingUnitDashboard } from '@/components/dashboard/hubs/processing-logistics/ProcessingUnitDashboard';
import { WarehouseDashboard } from '@/components/dashboard/hubs/processing-logistics/WarehouseDashboard';
import { CooperativeDashboard } from '@/components/dashboard/hubs/CooperativeDashboard';
import { CrowdfunderDashboard } from '@/components/dashboard/hubs/CrowdfunderDashboard';

const functions = getFunctions(firebaseApp);
const db = getFirestore(firebaseApp);


const HubComponentMap: { [key: string]: React.ComponentType } = {
    'Farmer': FarmerDashboard,
    'Agricultural Cooperative': CooperativeDashboard,
    'Buyer (Restaurant, Supermarket, Exporter)': BuyerDashboard,
    'Logistics Partner (Third-Party Transporter)': LogisticsDashboard,
    'Financial Institution (Micro-finance/Loans)': FiDashboard,
    'Input Supplier (Seed, Fertilizer, Pesticide)': InputSupplierDashboard,
    'Field Agent/Agronomist (DamDoh Internal)': FieldAgentDashboard,
    'Agro-Export Facilitator/Customs Broker': AgroExportDashboard,
    'Packaging Supplier': PackagingSupplierDashboard,
    'Government Regulator/Auditor': RegulatorDashboard,
    'Energy Solutions Provider (Solar, Biogas)': EnergyProviderDashboard,
    'Quality Assurance Team (DamDoh Internal)': QaDashboard,
    'Certification Body (Organic, Fair Trade etc.)': CertificationBodyDashboard,
    'Researcher/Academic': ResearcherDashboard,
    'Agronomy Expert/Consultant (External)': AgronomistDashboard,
    'Agro-Tourism Operator': AgroTourismDashboard,
    'Insurance Provider': InsuranceProviderDashboard,
    'Processing & Packaging Unit': ProcessingUnitDashboard,
    'Storage/Warehouse Facility': WarehouseDashboard,
    'Crowdfunder (Impact Investor, Individual)': CrowdfunderDashboard,
};


function PageSkeleton() {
    return (
        <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
                 <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="md:col-span-6 space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <div className="md:col-span-3">
                 <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
}

function MainContent() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const getFeed = useMemo(() => httpsCallable(functions, 'getFeed'), []);
  const createPostCallable = useMemo(() => httpsCallable(functions, 'createFeedPost'), []);
  const likePostCallable = useMemo(() => httpsCallable(functions, 'likePost'), []);
  const addCommentCallable = useMemo(() => httpsCallable(functions, 'addComment'), []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const fetchUserRoleAndFeed = async () => {
      setIsLoadingRole(true);
      setIsLoadingFeed(true);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          setUserRole(userDoc.data()?.primaryRole || 'general'); 
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('general'); 
        }
      } else {
        setUserRole(null);
      }
      setIsLoadingRole(false);

      // Fetch public feed regardless of user state
      try {
        const result = await getFeed({});
        setFeedItems((result.data as any).posts || []);
      } catch (error) {
        console.error("Error fetching feed:", error);
        toast({
          title: "Could not load feed",
          description: "There was an error fetching the latest posts.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFeed(false);
      }
    };
    fetchUserRoleAndFeed();
  }, [user, authLoading, getFeed, toast]);


  const handleCreatePost = async (content: string, media?: File, pollData?: { text: string }[]) => {
    try {
      await createPostCallable({ content, pollOptions: pollData });
      toast({ title: "Post Created!", description: "Your post is now live." });
      // Refresh feed
      const result = await getFeed({});
      setFeedItems((result.data as any).posts || []);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePostCallable({ postId });
    } catch(error) {
      console.error("Error liking post:", error);
      toast({ title: "Failed to like post", variant: "destructive" });
    }
  };
  
  const handleCommentOnPost = async (postId: string, commentText: string) => {
     try {
        await addCommentCallable({ postId, content: commentText });
        toast({ title: "Comment added!" });
     } catch(error) {
         console.error("Error adding comment:", error);
         toast({ title: "Failed to add comment", variant: "destructive" });
     }
  };

  const handleDeletePost = (postId: string) => {
    setFeedItems(prevItems => prevItems.filter(item => item.id !== postId));
     toast({ title: "Post Deleted (Simulated)" });
  };

  const renderContent = () => {
    if (isLoadingRole) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      );
    }
  
    const HubComponent = userRole ? HubComponentMap[userRole] : null;

    if (HubComponent) {
      return <HubComponent />;
    }

    // Default to feed for guests or users with unhandled roles
    if (isLoadingFeed) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      );
    }
    
    return feedItems.length > 0 ? (
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
          <p className="text-sm text-muted-foreground text-center py-10">No activity yet. Share your agricultural insights or explore the network!</p>
        </CardContent>
      </Card>
    );
  };

  if (authLoading) {
    return <PageSkeleton />;
  }


  return (
    <div className="grid md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-3">
        <DashboardLeftSidebar />
      </div>
      <div className="md:col-span-6 space-y-6">
        {user && <StartPost onCreatePost={handleCreatePost} />}
        {user && (
           <div className="flex items-center gap-2">
            <hr className="flex-grow"/>
            <span className="text-xs text-muted-foreground">Sort by: Top <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></Button></span>
          </div>
        )}
        {renderContent()}
      </div>
      <div className="md:col-span-3">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}


export default function DashboardPageWithSuspense() {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <MainContent />
      </Suspense>
    );
}
