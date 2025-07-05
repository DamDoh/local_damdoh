
"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeedItem } from "@/lib/types";
import { DashboardLeftSidebar } from "@/components/dashboard/DashboardLeftSidebar";
import { DashboardRightSidebar } from "@/components/dashboard/DashboardRightSidebar";
import { StartPost } from "@/components/dashboard/StartPost";
import { useHomepagePreference } from "@/hooks/useHomepagePreference";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp, db } from '@/lib/firebase/client'; // Import db
import { collection, query, orderBy, onSnapshot, doc, getDoc, limit } from "firebase/firestore"; // Import onSnapshot
import { useToast } from '@/hooks/use-toast';
import { FeedItemCard } from '@/components/dashboard/FeedItemCard';
import { LandingPage } from '@/components/landing/LandingPage';

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
import { LogisticsDashboard } from '@/components/dashboard/hubs/LogisticsDashboard';
import { PackagingSupplierDashboard } from '@/components/dashboard/hubs/PackagingSupplierDashboard';
import { ProcessingUnitDashboard } from '@/components/dashboard/hubs/processing-logistics/ProcessingUnitDashboard';
import { QaDashboard } from '@/components/dashboard/hubs/QaDashboard';
import { RegulatorDashboard } from '@/components/dashboard/hubs/RegulatorDashboard';
import { ResearcherDashboard } from '@/components/dashboard/hubs/ResearcherDashboard';
import { WarehouseDashboard } from '@/components/dashboard/hubs/processing-logistics/WarehouseDashboard';
import { WasteManagementDashboard } from '@/components/dashboard/hubs/WasteManagementDashboard';
import { OperationsDashboard } from '@/components/dashboard/hubs/OperationsDashboard';
import { AgriTechInnovatorDashboard } from '@/components/dashboard/hubs/AgriTechInnovatorDashboard';

const functions = getFunctions(firebaseApp);

const HubComponentMap: { [key: string]: React.ComponentType } = {
    'Agricultural Cooperative': CooperativeDashboard,
    'Agro-Export Facilitator/Customs Broker': AgroExportDashboard,
    'Agri-Tech Innovator/Developer': AgriTechInnovatorDashboard,
    'Agronomy Expert/Consultant (External)': AgronomistDashboard,
    'Agro-Tourism Operator': AgroTourismDashboard,
    'Buyer (Restaurant, Supermarket, Exporter)': BuyerDashboard,
    'Certification Body (Organic, Fair Trade etc.)': CertificationBodyDashboard,
    'Crowdfunder (Impact Investor, Individual)': CrowdfunderDashboard,
    'Energy Solutions Provider (Solar, Biogas)': EnergyProviderDashboard,
    'Equipment Supplier (Sales of Machinery/IoT)': EquipmentSupplierDashboard,
    'Farmer': FarmerDashboard,
    'Field Agent/Agronomist (DamDoh Internal)': FieldAgentDashboard,
    'Financial Institution (Micro-finance/Loans)': FiDashboard,
    'Government Regulator/Auditor': RegulatorDashboard,
    'Input Supplier (Seed, Fertilizer, Pesticide)': InputSupplierDashboard,
    'Insurance Provider': InsuranceProviderDashboard,
    'Logistics Partner (Third-Party Transporter)': LogisticsDashboard,
    'Operations/Logistics Team (DamDoh Internal)': OperationsDashboard,
    'Packaging Supplier': PackagingSupplierDashboard,
    'Processing & Packaging Unit': ProcessingUnitDashboard,
    'Quality Assurance Team (DamDoh Internal)': QaDashboard,
    'Researcher/Academic': ResearcherDashboard,
    'Storage/Warehouse Facility': WarehouseDashboard,
    'Waste Management & Compost Facility': WasteManagementDashboard,
};

function PageSkeleton() {
    return (
        <div className="grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3 lg:col-span-2">
                 <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="md:col-span-6 lg:col-span-7 space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <div className="hidden lg:block md:col-span-3">
                 <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
}

export function MainDashboard() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const createPostCallable = useMemo(() => httpsCallable(functions, 'createFeedPost'), []);
  const likePostCallable = useMemo(() => httpsCallable(functions, 'likePost'), []);
  const addCommentCallable = useMemo(() => httpsCallable(functions, 'addComment'), []);

  // Use real-time listener for the feed
  useEffect(() => {
    setIsLoadingFeed(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const items: FeedItem[] = [];
        for (const postDoc of querySnapshot.docs) {
            const postData = postDoc.data();
            items.push({
                id: postDoc.id,
                type: postData.pollOptions ? 'poll' : 'forum_post',
                timestamp: postData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                userId: postData.userId,
                userName: postData.userName,
                userAvatar: postData.userAvatar,
                userHeadline: postData.userHeadline,
                content: postData.content,
                likesCount: postData.likesCount || 0,
                commentsCount: postData.commentsCount || 0,
                pollOptions: postData.pollOptions || null,
                link: `/posts/${postDoc.id}`, 
                postImage: null, 
                dataAiHint: null, 
            });
        }
        setFeedItems(items);
        setIsLoadingFeed(false);
    }, (error) => {
        console.error("Error fetching real-time feed:", error);
        toast({
          title: "Could not load feed",
          description: "There was an error fetching the latest posts.",
          variant: "destructive"
        });
        setIsLoadingFeed(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [toast]);


  // Fetch user role
  useEffect(() => {
    if (authLoading) return;
    setIsLoadingRole(true);
    if (user) {
        getDoc(doc(db, 'users', user.uid))
            .then(userDoc => setUserRole(userDoc.data()?.primaryRole || 'general'))
            .catch(error => {
                console.error("Error fetching user role:", error);
                setUserRole('general');
            })
            .finally(() => setIsLoadingRole(false));
    } else {
        setUserRole(null);
        setIsLoadingRole(false);
    }
  }, [user, authLoading]);


  const handleCreatePost = async (content: string, media?: File, pollData?: { text: string }[]) => {
    try {
      await createPostCallable({ content, pollOptions: pollData });
      toast({ title: "Post Created!", description: "Your post is now live." });
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
    // In a real app, you would call a cloud function to delete the post and its subcollections.
    // For this simulation, we'll just filter it out from the local state.
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
      <div className="md:col-span-3 lg:col-span-2">
        <DashboardLeftSidebar />
      </div>
      <div className="md:col-span-6 lg:col-span-7 space-y-6">
        {user && <StartPost onCreatePost={handleCreatePost} />}
        {user && (
           <div className="flex items-center gap-2">
            <hr className="flex-grow"/>
            <span className="text-xs text-muted-foreground">Sort by: Top <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></Button></span>
          </div>
        )}
        {renderContent()}
      </div>
      <div className="hidden lg:block md:col-span-3">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}
