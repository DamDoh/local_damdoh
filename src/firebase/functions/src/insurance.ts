

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * =================================================================
 * Module 11: Insurance Service
 * =================================================================
 */

// --- Internal AI-Driven Functions (moved from ai-and-analytics.ts) ---

/**
 * Internal logic for assessing insurance risk for a policy.
 * This is an internal function to be called by other functions within this module.
 *
 * @param {any} data Data payload including policy, policyholder, and asset details.
 * @return {Promise<object>} An object with the insurance risk score
 * and contributing factors.
 */
async function _internalAssessInsuranceRisk(data: any) {
    console.log("_internalAssessInsuranceRisk called with data:", data);
    const riskScore = Math.random() * 10;
    const riskFactors = [
        "High flood risk in region",
        "Lack of documented pest management",
        "Monocropping practice",
    ];
    return {
        insuranceRiskScore: riskScore.toFixed(2),
        riskFactors: riskFactors,
        status: "placeholder_assessment_complete",
    };
}

/**
 * Internal logic for verifying an insurance claim's validity.
 * This is an internal function to be called by other functions within this module.
 *
 * @param {any} data Data payload including claim details, policy, and other
 * evidence (e.g., weather data).
 * @return {Promise<object>} An object with the verification result, including
 * status and payout amount if approved.
 */
async function _internalVerifyClaim(data: any) {
    console.log("_internalVerifyClaim called with data:", data);
    const verificationResult = {
        status: Math.random() > 0.3 ? "approved" : "rejected",
        payoutAmount: 500.00,
        assessmentDetails: {
            verificationLog: "Weather data confirmed drought during incident period. Farm activity logs consistent.",
            dataPointsConsidered: [
                "weather_data",
                "farm_activity_logs",
                "vti_events",
            ],
        },
    };
    return verificationResult;
}


// --- Main Module Functions ---

export const assessRiskForPolicy = functions.firestore
  .document("insurance_policies/{policyId}")
  .onWrite(async (change, context) => {
    const policyAfter = change.after.data();
    if (
      !policyAfter ||
      (change.before.exists &&
        change.after.data()?.updatedAt?.isEqual(change.before.data()?.updatedAt))
    ) {
      return null;
    }

    const policyId = context.params.policyId;
    const policyholderRef = policyAfter?.policyholderRef as
      | admin.firestore.DocumentReference
      | undefined;
    const insuredAssets = policyAfter?.insuredAssets as
      | Array<{type: string; assetRef: admin.firestore.DocumentReference}>
      | undefined;

    if (!policyholderRef || !insuredAssets || insuredAssets.length === 0) {
      console.log(
        `Policy ${policyId} is missing policyholder or insured assets, skipping risk assessment.`,
      );
      return null;
    }

    const userId = policyholderRef.id;

    console.log(
      `Initiating risk assessment for policy ${policyId} (User/Org: ${userId})...`,
    );

    try {
      const policyholderDetails = (await policyholderRef.get()).data();
      const insuredAssetsDetails = await Promise.all(
        insuredAssets.map(async (asset) => {
          const assetDoc = await asset.assetRef.get();
          return assetDoc.exists ?
            {
              type: asset.type,
              assetId: asset.assetRef.id,
              details: assetDoc.data(),
            } :
            null;
        }),
      ).then((results) => results.filter((r) => r !== null));

      const relevantData = {
        policyDetails: policyAfter,
        policyholderDetails,
        insuredAssetsDetails,
      };

      console.log("Sending data to internal AI for assessment...");
      const assessmentResult = await _internalAssessInsuranceRisk(relevantData);

      const newRiskAssessmentRef = db.collection("risk_assessments").doc();
      await newRiskAssessmentRef.set({
        assessmentId: newRiskAssessmentRef.id,
        userRef: policyholderRef,
        assessmentDate: admin.firestore.FieldValue.serverTimestamp(),
        score: assessmentResult.insuranceRiskScore,
        riskFactors: assessmentResult.riskFactors,
        aiModelVersion: "v1.0-placeholder",
        recommendations_en: [
          "Improve irrigation systems",
          "Diversify crops",
        ],
        recommendations_local: {
          es: ["Mejorar sistemas de riego", "Diversificar cultivos"],
        },
      });
      console.log(
        `Risk assessment stored with ID: ${newRiskAssessmentRef.id} for policy ${policyId}.`,
      );

      await change.after.ref.set(
        {
          riskAssessmentRef: newRiskAssessmentRef,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );
      console.log(
        `Policy ${policyId} updated with risk assessment reference.`,
      );

      return null;
    } catch (error) {
      console.error(
        `Error during risk assessment for policy ${policyId}:`,
        error,
      );
      return null;
    }
  });

export const processInsuranceClaim = functions.firestore
  .document("claims/{claimId}")
  .onCreate(async (snapshot, context) => {
    const claimId = context.params.claimId;
    const claimData = snapshot.data();
    if (!claimData) return null;

    console.log(`Initiating processing for claim ${claimId}...`);

    const policyRef = claimData?.policyRef as
      | admin.firestore.DocumentReference
      | undefined;
    const incidentDate = claimData?.incidentDate as
      | admin.firestore.Timestamp
      | undefined;

    if (!policyRef || !incidentDate) {
      console.error(
        `Claim ${claimId} is missing policy reference or incident date.`,
      );
      return null;
    }

    try {
      const policyDoc = await policyRef.get();
      const policyData = policyDoc.data();

      if (!policyDoc.exists || !policyData) {
        console.error(
          `Policy not found for claim ${claimId}. Policy ID: ${policyRef.id}`,
        );
        return null;
      }

      const insuredAssets = policyData.insuredAssets as
        | Array<{type: string; assetRef: admin.firestore.DocumentReference}>
        | undefined;

      if (!insuredAssets || insuredAssets.length === 0) {
        console.error(
          `Policy ${policyRef.id} linked to claim ${claimId} has no insured assets.`,
        );
        return null;
      }

      const claimVerificationData: {[key: string]: any} = {
        claimDetails: claimData,
        policyDetails: policyData,
        insuredAssetsDetails: await Promise.all(
          insuredAssets.map(async (asset) =>
            (await asset.assetRef.get()).data(),
          ),
        ),
      };

      console.log("Sending data to internal AI for claim verification and payout...");
      const claimResult = await _internalVerifyClaim(claimVerificationData);

      const updateData: any = {
        status: claimResult.status === "approved" ? "approved" : "rejected",
        assessmentDetails: claimResult.assessmentDetails,
      };

      if (
        claimResult.status === "approved" &&
        claimResult.payoutAmount !== undefined
      ) {
        updateData.payoutAmount = claimResult.payoutAmount;
        console.log(
          `Claim ${claimId} approved, triggering payout via Module 7 (placeholder)...`,
        );
      }

      await snapshot.ref.update(updateData);
      console.log(
        `Claim ${claimId} processing complete. Status: ${updateData.status}.`,
      );

      return null;
    } catch (error: any) {
      console.error(`Error during claim processing for claim ${claimId}:`, error);
      await snapshot.ref.update({
        status: "processing_error",
        assessmentDetails: {error: error.message},
      });
      return null;
    }
  });

export const triggerParametricPayout = functions.firestore
  .document("weather_readings/{readingId}")
  .onCreate(
    async (
      snapshot: admin.firestore.DocumentSnapshot,
      context: functions.EventContext,
    ) => {
      const weatherReading = snapshot.data();
      if (!weatherReading) return null;

      const location = weatherReading?.location;
      const readingDate = weatherReading?.timestamp;

      if (!location || !readingDate) {
        console.log(
          `Weather reading ${snapshot.id} missing location or timestamp, skipping parametric check.`,
        );
        return null;
      }

      console.log(
        `Checking for parametric payout triggers based on weather reading at ${
          location.latitude
        }, ${location.longitude} on ${readingDate.toDate()}...`,
      );

      try {
        console.log("Querying for relevant parametric policies (placeholder)...");
        const relevantPolicies: admin.firestore.QuerySnapshot = {
          empty: false,
          docs: [
                {
                  id: "policy123",
                  ref: db.collection("insurance_policies").doc("policy123"),
                  data: () =>
                    ({
                      policyholderRef: db.collection("users").doc("userABC"),
                      insuredAssets: [
                        {assetRef: db.collection("geospatial_assets").doc("geoXYZ")},
                      ],
                      parametricThresholds: {
                        rainfall: {threshold: 100, periodHours: 24, payoutPercentage: 50},
                      },
                      coverageAmount: 10000,
                      currency: "USD",
                    }),
                } as admin.firestore.QueryDocumentSnapshot<any>,
          ],
        } as unknown as admin.firestore.QuerySnapshot;
        const policyCount = relevantPolicies.docs.length;
        console.log(`Found ${policyCount} potentially relevant parametric policies.`);

        if (relevantPolicies.empty) {
          console.log("No relevant parametric policies found for this weather reading.");
          return null;
        }

        for (const policyDoc of relevantPolicies.docs) {
          const policyId = policyDoc.id;
          const policyData = policyDoc.data();
          const parametricThresholds = policyData?.parametricThresholds;

          if (!parametricThresholds) {
            console.log(
              `Policy ${policyId} is missing parametric thresholds, skipping.`,
            );
            continue;
          }

          let triggerMet = false;
          let payoutPercentage = 0;

          if (
            parametricThresholds.rainfall &&
              weatherReading.rainfall !== undefined
          ) {
            console.log(
              `Checking rainfall trigger for policy ${policyId}... Current reading rainfall: ${weatherReading.rainfall}`,
            );
            if (
              weatherReading.rainfall > parametricThresholds.rainfall.threshold
            ) {
              triggerMet = true;
              payoutPercentage =
                  parametricThresholds.rainfall.payoutPercentage;
              console.log(
                `Rainfall trigger met for policy ${policyId}! Payout percentage: ${payoutPercentage}%`,
              );
            }
          }

          if (triggerMet && payoutPercentage > 0) {
            const coverageAmount = policyData.coverageAmount || 0;
            const payoutAmount = (coverageAmount * payoutPercentage) / 100;
            const currency = policyData.currency || "USD";
            const policyholderRef = policyData.policyholderRef as admin.firestore.DocumentReference;

            if (payoutAmount > 0 && policyholderRef) {
              console.log(
                `Triggering parametric payout of ${payoutAmount} ${currency} for policy ${policyId}...`,
              );
              const newClaimRef = db.collection("claims").doc();

              await newClaimRef.set({
                claimId: newClaimRef.id,
                policyRef: policyDoc.ref,
                policyholderRef: policyholderRef,
                insurerRef: policyData.insurerRef,
                submissionDate: admin.firestore.FieldValue.serverTimestamp(),
                status: "approved",
                claimedAmount: payoutAmount,
                currency: currency,
                incidentDate: readingDate,
                description: "Parametric payout triggered by weather event.",
                supportingDocumentsUrls: [snapshot.ref.path],
                assessmentDetails: {
                  trigger: "parametric_weather",
                  weatherReadingId: snapshot.id,
                  details: weatherReading,
                  payoutPercentage: payoutPercentage,
                },
                payoutAmount: payoutAmount,
                payoutDate: admin.firestore.FieldValue.serverTimestamp(),
              });
              console.log(
                `Parametric payout claim created with ID: ${newClaimRef.id} for policy ${policyId}.`,
              );
              console.log(
                `Triggering payout via Module 7 for claim ${newClaimRef.id} (placeholder)...`,
              );
            } else {
              console.log(
                `Calculated payout amount is 0 or policyholder reference is missing for policy ${policyId}, skipping payout.`,
              );
            }
          }
        }

        return null;
      } catch (error) {
        console.error(
          `Error during parametric payout trigger for weather reading ${snapshot.id}:`,
          error,
        );
        return null;
      }
    },
  );


const checkInsuranceProviderAuth = async (context: functions.https.CallableContext) => {
    const uid = context.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const userDoc = await db.collection("users").doc(uid).get();
    const userRole = userDoc.data()?.primaryRole;
    
    if (userRole !== 'Insurance Provider') {
         throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
    }
    
    return uid;
};


export const createInsuranceProduct = functions.https.onCall(async (data, context) => {
    const providerId = await checkInsuranceProviderAuth(context);
    const { name, type, description, coverageDetails, premium, currency } = data;

    if (!name || !type || !description || premium === undefined) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required product fields.");
    }

    const productRef = db.collection("insurance_products").doc();
    await productRef.set({
        providerId,
        name,
        type, // e.g., 'Crop', 'Livestock'
        description,
        coverageDetails: coverageDetails || null,
        premium: Number(premium),
        currency: currency || 'USD',
        status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, productId: productRef.id };
});


export const getInsuranceProducts = functions.https.onCall(async (data, context) => {
    const providerId = await checkInsuranceProviderAuth(context);

    const productsSnapshot = await db.collection("insurance_products")
        .where("providerId", "==", providerId)
        .orderBy("createdAt", "desc")
        .get();

    const products = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
            updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });
    
    return { products };
});

```
- src/firebase/functions/src/types.ts</file>
    <content><![CDATA[

import type { z } from 'zod';
import type { 
    StakeholderProfileSchema,
    MarketplaceItemSchema,
    MarketplaceOrderSchema,
    ForumPostSchema,
    AgriEventSchema
} from './schemas';
import type { MarketplaceRecommendationOutputSchema } from '@/ai/flows/marketplace-recommendations';

// =================================================================
// 1. CORE TYPES (INFERRED FROM ZOD SCHEMAS)
// These are the primary data structures used across the application.
// =================================================================

export type UserProfile = z.infer<typeof StakeholderProfileSchema>;
export type MarketplaceItem = z.infer<typeof MarketplaceItemSchema>;
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema>;
export type AgriEvent = z.infer<typeof AgriEventSchema>;
export type ForumTopic = z.infer<typeof ForumPostSchema>;
export type UserRole = "Admin" | "Regulator" | "Auditor" | "Farmer" | "System" | "Buyer" | "Input Supplier" | "Agricultural Cooperative" | "Field Agent/Agronomist (DamDoh Internal)" | "Financial Institution (Micro-finance/Loans)" | "Logistics Partner (Third-Party Transporter)" | "Processing & Packaging Unit" | "Researcher/Academic" | "Quality Assurance Team (DamDoh Internal)" | "Certification Body (Organic, Fair Trade etc.)" | "Insurance Provider" | "Energy Solutions Provider (Solar, Biogas)" | "Agro-Tourism Operator" | "Agro-Export Facilitator/Customs Broker" | "Crowdfunder (Impact Investor, Individual)" | "Consumer" | "General" | "Equipment Supplier (Sales of Machinery/IoT)" | "Waste Management & Compost Facility" | "Storage/Warehouse Facility" | "Agronomy Expert/Consultant (External)" | "Agri-Tech Innovator/Developer" | "Operations/Logistics Team (DamDoh Internal)" | "Packaging Supplier";


export interface MarketplaceCoupon {
    id: string;
    sellerId: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiresAt: any;
    usageLimit: number | null;
    usageCount: number;
    isActive: boolean;
    applicableToListingIds: string[];
    applicableToCategories: string[];
    createdAt: any;
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    stakeholderType: string;
    createdAt: any;
    updatedAt: any;
    logoUrl: string | null;
    bannerUrl: string | null;
    contactInfo: {
        phone?: string;
        website?: string;
    };
    itemCount: number;
    rating: number;
}

export type ForumGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  ownerId: string;
  createdAt: string; // ISO String
}

export interface Connection {
    id: string; // User ID of the connection
    displayName: string;
    avatarUrl?: string;
    primaryRole: string;
    profileSummary: string;
}

export interface ConnectionRequest {
    id: string; // The request document ID
    requester: {
        id: string;
        displayName: string;
        avatarUrl?: string;
        primaryRole: string;
    };
    createdAt: string; // ISO string
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: 'like' | 'comment' | 'new_order' | 'new_connection_request' | 'event_reminder' | 'service_reminder' | 'profile_view';
  title_en: string;
  body_en: string;
  linkedEntity: {
    collection: string;
    documentId: string;
  } | null;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
}


// =================================================================
// 2. DASHBOARD & UI-SPECIFIC TYPES
// =================================================================
export interface FarmerDashboardAlert {
    id: string;
    icon: 'FlaskConical' | 'Sprout';
    type: 'info' | 'warning';
    message: string;
    link: string;
}

export interface FinancialTransaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    timestamp: any; // Allow for firestore timestamp
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
}

export interface FarmerDashboardData {
  farmCount: number;
  cropCount: number;
  recentCrops: {
      id: string;
      name: string;
      stage: string;
      farmName: string;
      farmId: string;
      plantingDate: string | null;
  }[];
  knfBatches: {
    id: string;
    typeName: string;
    status: string;
    nextStepDate: string | null;
  }[];
  financialSummary?: FinancialSummary;
  alerts?: FarmerDashboardAlert[];
  certifications?: {
    id: string;
    name: string;
    issuingBody: string;
  }[];
}

export interface CooperativeDashboardData {
    memberCount: number;
    totalLandArea: number; // in Hectares
    aggregatedProduce: {
        id: string;
        productName: string;
        quantity: number; // in tons
        quality: string;
        readyBy: string; // ISO Date string
    }[];
    pendingMemberApplications: number;
}


export interface BuyerDashboardData {
  supplyChainRisk: {
    region: string;
    level: string;
    factor: string;
    action: {
      label: string;
      link: string;
    };
  };
  sourcingRecommendations: {
    id: string;
    name: string;
    product: string;
    reliability: number;
    vtiVerified: boolean;
  }[];
  marketPriceIntelligence: {
    product: string;
    trend: 'up' | 'down' | 'stable';
    forecast: string;
    action: {
      label: string;
      link: string;
    };
  };
}


export interface RegulatorDashboardData {
  complianceRiskAlerts: {
    id: string;
    issue: string;
    region: string;
    severity: 'High' | 'Medium' | 'Low';
    actionLink: string;
  }[];
  pendingCertifications: {
    count: number;
    actionLink: string;
  };
  supplyChainAnomalies: {
    id: string;
    description: string;
    level: 'Critical' | 'Warning';
    vtiLink: string;
  }[];
}


export interface LogisticsDashboardData {
    activeShipments: {
        id: string;
        to: string;
        status: string;
        eta: string;
        vtiLink: string;
    }[];
    incomingJobs: {
        id: string;
        from: string;
        to: string;
        product: string;
        requirements: string;
        actionLink: string;
    }[];
    performanceMetrics: {
        onTimePercentage: number;
        fuelEfficiency: string;
        actionLink: string;
    };
}

export interface FiDashboardData {
    pendingApplications: FinancialApplication[];
    portfolioAtRisk: {
        count: number;
        value: number;
        highestRisk: {
            name: string;
            reason: string;
        };
        actionLink: string;
    };
    marketUpdates: {
        id: string;
        content: string;
        actionLink: string;
    }[];
}

export interface FieldAgentDashboardData {
    assignedFarmers: {
        id: string;
        name: string;
        lastVisit: string; // ISO string
        issues: number;
        actionLink: string;
    }[];
    portfolioHealth: {
        overallScore: number;
        alerts: string[];
        actionLink: string;
    };
    pendingReports: number;
    dataVerificationTasks: {
        count: number;
        description: string;
        actionLink: string;
    };
}

export interface InputSupplierDashboardData {
    demandForecast: {
        id: string;
        region: string;
        product: string;
        trend: 'High' | 'Steady' | 'Low';
        reason: string;
    }[];
    productPerformance: {
        id: string;
        productName: string;
        rating: number;
        feedback: string;
        link: string;
    }[];
    activeOrders: {
        count: number;
        value: number;
        link: string;
    };
}

export interface AgroExportDashboardData {
    pendingCustomsDocs: {
        id: string;
        vtiLink: string;
        destination: string;
        status: string;
    }[];
    trackedShipments: {
        id: string;
        status: string;
        location: string;
        carrier: string;
    }[];
    complianceAlerts: {
        id: string;
        content: string;
        actionLink: string;
    }[];
}

export interface ProcessingUnitDashboardData {
  yieldOptimization: {
    currentYield: number;
    potentialYield: number;
    suggestion: string;
  };
  inventory: {
    product: string;
    quality: string;
    tons: number;
  }[];
  wasteReduction: {
    currentRate: number;
    insight: string;
  };
  packagingOrders: {
    id: string;
    supplierName: string;
    deliveryDate: string;
    status: string;
    actionLink: string;
  }[];
  packagingInventory: {
    packagingType: string;
    unitsInStock: number;
    reorderLevel: number;
  }[];
}


export interface WarehouseDashboardData {
  storageOptimization: {
    utilization: number;
    suggestion: string;
  };
  inventoryLevels: {
    totalItems: number;
    itemsNeedingAttention: number;
  };
  predictiveAlerts: {
    alert: string;
    actionLink: string;
  }[];
}


export interface QaDashboardData {
  pendingInspections: {
    id: string;
    batchId: string;
    productName: string;
    sellerName: string;
    dueDate: string; // ISO String
    actionLink: string;
  }[];
  recentResults: {
    id: string;
    productName: string;
    result: 'Pass' | 'Fail';
    reason?: string;
    inspectedAt: string; // ISO String
  }[];
  qualityMetrics: {
    passRate: number;
    averageScore: number;
  };
}


export interface CertificationBodyDashboardData {
  pendingAudits: {
    id: string;
    farmName: string;
    standard: string;
    dueDate: string; // ISO String
    actionLink: string;
  }[];
  certifiedEntities: {
    id: string;
    name: string;
    type: string;
    certificationStatus: 'Active' | 'Pending Renewal' | 'Expired';
    actionLink: string;
  }[];
  standardsMonitoring: {
    standard: string;
    adherenceRate: number;
    alerts: number;
    actionLink: string;
  }[];
}

export interface ResearcherDashboardData {
  availableDatasets: {
    id: string;
    name: string;
    dataType: string;
    accessLevel: 'Public' | 'Requires Request';
    actionLink: string;
  }[];
  ongoingProjects: {
    id: string;
    title: string;
    progress: number;
    collaborators: string[];
    actionLink: string;
  }[];
  knowledgeHubContributions: {
    id: string;
    title: string;
    status: 'Published' | 'Pending Review' | 'Draft';
  }[];
}

export interface AgronomistDashboardData {
  assignedFarmersOverview: {
    id: string;
    name: string;
    farmLocation: string;
    lastConsultation: string; // ISO String
    alerts: number;
  }[];
  pendingConsultationRequests: {
    id: string;
    farmerId: string;
    farmerName: string;
    issueSummary: string;
    requestDate: string; // ISO String
  }[];
  knowledgeHubContributions: {
    id: string;
    title: string;
    status: 'Published' | 'Pending Review' | 'Draft';
  }[];
}


export interface EnergyProviderDashboardData {
  projectLeads: {
    id: string;
    entityName: string;
    location: string;
    estimatedEnergyNeed: string;
    status: 'New' | 'Contacted' | 'Proposal Sent' | 'Closed';
    actionLink: string;
  }[];
  activeProjects: {
    id: string;
    projectName: string;
    solutionType: string;
    status: 'In Progress' | 'Completed';
    completionDate: string; // ISO String
  }[];
  impactMetrics: {
    totalInstallations: number;
    totalEstimatedCarbonReduction: string;
  };
}


export interface CrowdfunderDashboardData {
  portfolioOverview: {
    totalInvested: number;
    numberOfInvestments: number;
    estimatedReturns: number;
  };
  suggestedOpportunities: {
    id: string;
    projectName: string;
    category: string;
    fundingGoal: number;
    amountRaised: number;
    actionLink: string;
  }[];
  recentTransactions: {
    id: string;
    projectName: string;
    type: 'Investment' | 'Payout';
    amount: number;
    date: string; // ISO String
  }[];
}

export interface EquipmentSupplierDashboardData {
  listedEquipment: {
    id: string;
    name: string;
    type: 'Sale' | 'Rental';
    status: 'Available' | 'Rented Out';
    actionLink: string;
  }[];
  rentalActivity: {
    totalRentals: number;
  };
  pendingMaintenanceRequests: {
    id: string;
    equipmentName: string;
    issue: string;
    farmerName: string;
    actionLink: string;
  }[];
}

export interface WasteManagementDashboardData {
  incomingWasteStreams: {
    id: string;
    type: string; // e.g., 'Crop Residue', 'Animal Manure'
    source: string; // e.g., 'Green Valley Farms'
    quantity: string; // e.g., '5 tons'
  }[];
  compostBatches: {
    id: string;
    status: 'Active' | 'Curing' | 'Ready';
    estimatedCompletion: string; // ISO date
  }[];
  finishedProductInventory: {
    product: string;
    quantity: string; // e.g., '20 tons'
    actionLink: string;
  }[];
}
    

export interface PackagingSupplierDashboardData {
  incomingOrders: {
    id: string;
    customerName: string;
    product: string;
    quantity: number;
    status: 'New' | 'Processing' | 'Shipped';
    actionLink: string;
  }[];
  inventory: {
    id: string;
    item: string;
    stock: number;
    reorderLevel: number;
  }[];
}

export interface SustainabilityDashboardData {
    carbonFootprint: { total: number; unit: string; trend: number; };
    waterUsage: { efficiency: number; unit: string; trend: number; };
    biodiversityScore: { score: number; unit: string; trend: number; };
    sustainablePractices: { id: string; practice: string; lastLogged: string; }[];
    certifications: { id:string; name: string; status: string; expiry: string; }[];
}

export interface InsuranceProviderDashboardData {
  pendingClaims: {
    id: string;
    policyHolderName: string;
    policyType: 'Crop' | 'Livestock';
    claimDate: string; // ISO string
    status: 'Submitted' | 'Under Review';
    actionLink: string;
  }[];
  riskAssessmentAlerts: {
    id: string;
    policyHolderName: string;
    alert: string;
    severity: 'High' | 'Medium' | 'Low';
    actionLink: string;
  }[];
  activePolicies: {
    id: string;
    policyHolderName: string;
    policyType: string;
    coverageAmount: number;
    expiryDate: string; // ISO string;
  }[];
}

export interface OperationsDashboardData {
  vtiGenerationRate: {
    rate: number;
    unit: 'VTIs/hour';
    trend: number;
  };
  dataPipelineStatus: {
    status: 'Operational' | 'Degraded' | 'Offline';
    lastChecked: string; // ISO string
  };
  flaggedEvents: {
    id: string;
    type: 'Anomalous Geolocation' | 'Unusual Time Lag' | 'Data Mismatch';
    description: string;
    vtiLink: string;
  }[];
}

export interface FinancialApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  fiId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  riskScore?: number;
  purpose: string;
  submittedAt: string | null;
  actionLink?: string;
  applicantProfile?: UserProfile;
}

export interface FinancialProduct {
  id: string;
  fiId: string;
  name: string;
  type: 'Loan' | 'Grant';
  description: string;
  interestRate?: number;
  maxAmount?: number;
  targetRoles: string[];
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface InsuranceProduct {
  id: string;
  providerId: string;
  name: string;
  type: 'Crop' | 'Livestock' | 'Asset' | 'Weather';
  description: string;
  coverageDetails: string;
  premium: number;
  currency: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}


export type KnfBatch = {
    id: string;
    userId: string;
    type: string; // 'fpj', 'faa', etc.
    typeName: string; // "Fermented Plant Juice"
    ingredients: string;
    startDate: any; // Firestore Timestamp
    nextStepDate: any; // Firestore Timestamp
    status: 'Fermenting' | 'Ready' | 'Used' | 'Archived';
    nextStep: string;
    createdAt?: any;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  topicId: string;
  topicName: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  replyCount: number;
}

export interface GroupPost {
  id: string;
  title: string;
  content: string;
  authorRef: string;
  authorName: string;
  authorAvatarUrl: string;
  replyCount: number;
  createdAt: string; // ISO
}

export interface PostReply {
    id: string;
    content: string;
    timestamp: string; // ISO string
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    // Re-introducing denormalized fields for use in FeedItemCard
    userId: string;
    userName: string;
    userAvatar?: string;
}

export interface PollOption {
  text: string;
  votes?: number;
}

export interface FeedItem {
  id: string;
  type: 'forum_post' | 'marketplace_listing' | 'success_story' | 'poll';
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userHeadline?: string;
  content: string;
  link: string;
  imageUrl?: string;
  dataAiHint?: string;
  likesCount: number;
  commentsCount: number;
  pollOptions?: PollOption[];
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
}

export interface MobileHomeCategory {
    id: string;
    name: string;
    icon: React.ElementType;
    href: string;
    dataAiHint?: string;
}

export interface MobileDiscoverItem {
    id: string;
    title: string;
    imageUrl: string;
    type: 'Marketplace' | 'Forum' | 'Profile' | 'Service';
    link: string;
    dataAiHint?: string;
}

export interface AgroTourismDashboardData {
  upcomingBookings: {
    id: string;
    experienceTitle: string;
    guestName: string;
    date: string; // ISO String
    actionLink: string;
  }[];
  listedExperiences: {
    id: string;
    title: string;
    location: string;
    status: 'Published' | 'Draft';
    bookingsCount: number;
    actionLink: string;
  }[];
  guestReviews: {
    id: string;
    guestName: string;
    experienceTitle: string;
    rating: number;
    comment: string;
    actionLink: string;
  }[];
}

export interface AgriTechInnovatorDashboardData {
  apiKeys: {
    id: string;
    key: string;
    status: 'Active' | 'Revoked';
    environment: 'Sandbox' | 'Production';
    createdAt: string; // ISO String
  }[];
  sandboxStatus: {
    status: 'Operational' | 'Degraded' | 'Offline';
    lastReset: string; // ISO String
  };
  integrationProjects: {
    id: string;
    title: string;
    status: 'In Development' | 'Live' | 'Archived';
    partner: string;
    actionLink: string;
  }[];
}

export interface Worker {
  id: string;
  name: string;
  contactInfo?: string;
  payRate?: number;
  payRateUnit?: string;
  totalHoursLogged?: number;
  totalPaid?: number;
}

export interface WorkLog {
    id: string;
    hours: number;
    date: string; // ISO string
    taskDescription: string;
    isPaid: boolean;
}

export interface PaymentLog {
    id: string;
    amount: number;
    currency: string;
    date: string; // ISO string
    notes: string;
}

export type ServiceItem = MarketplaceItem & {
    listingType: 'Service';
    skillsRequired: string[];
    compensation: string;
    experienceLevel: string;
};

// AI Related Types
export type MarketplaceRecommendation = z.infer<typeof MarketplaceRecommendationOutputSchema>;
