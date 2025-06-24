
"use client";

import { useAuth } from "@/lib/auth-utils";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";
import { FarmerDashboard } from "@/components/dashboard/hubs/FarmerDashboard";
import { BuyerDashboard } from "@/components/dashboard/hubs/BuyerDashboard";
import { RegulatorDashboard } from "@/components/dashboard/hubs/RegulatorDashboard";
import { LogisticsDashboard } from "@/components/dashboard/hubs/LogisticsDashboard";
import { FiDashboard } from "@/components/dashboard/hubs/FiDashboard";
import { FieldAgentDashboard } from "@/components/dashboard/hubs/FieldAgentDashboard";
import { InputSupplierDashboard } from "@/components/dashboard/hubs/InputSupplierDashboard";
import { EnergyProviderDashboard } from "@/components/dashboard/hubs/EnergyProviderDashboard";
import { PackagingSupplierDashboard } from "@/components/dashboard/hubs/PackagingSupplierDashboard";
import { ProcessingUnitDashboard } from "@/components/dashboard/hubs/processing-logistics/ProcessingUnitDashboard";
import { WarehouseDashboard } from "@/components/dashboard/hubs/processing-logistics/WarehouseDashboard";
import { AgroExportDashboard } from "@/components/dashboard/hubs/processing-logistics/AgroExportDashboard";
import { QaDashboard } from "@/components/dashboard/hubs/QaDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const db = getFirestore(firebaseApp);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists()) {
          setUserRole(userDoc.data()?.primaryRole || "farmer"); 
        } else {
          setUserRole("farmer"); 
        }
        setIsLoadingRole(false);
      };
      fetchUserRole();
    } else if (!authLoading) {
      setIsLoadingRole(false);
    }
  }, [user, authLoading]);

  const renderDashboard = () => {
    if (isLoadingRole || authLoading) {
      return <DashboardSkeleton />;
    }

    switch (userRole) {
      case "farmer":
        return <FarmerDashboard />;
      case "buyer":
        return <BuyerDashboard />;
      case "regulator":
        return <RegulatorDashboard />;
      case "logistics_partner":
        return <LogisticsDashboard />;
      case "fi":
        return <FiDashboard />;
      case "field_agent":
        return <FieldAgentDashboard />;
      case "input_supplier":
        return <InputSupplierDashboard />;
      case "energy_provider":
        return <EnergyProviderDashboard />;
      case "packaging_supplier":
        return <PackagingSupplierDashboard />;
      case "processing_unit":
        return <ProcessingUnitDashboard />;
      case "warehouse":
        return <WarehouseDashboard />;
      case "agro_export":
        return <AgroExportDashboard />;
      case "qa":
        return <QaDashboard />;
      default:
        return <FarmerDashboard />;
    }
  };

  return <div className="p-4 md:p-6">{renderDashboard()}</div>;
}

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-96 w-full rounded-lg" />
    </div>
)
