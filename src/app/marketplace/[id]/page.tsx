// Add comments within the Marketplace item detail page component (`src/app/marketplace/[id]/page.tsx`)
// to describe how the call-to-action button or flow would change based on the `listingType`.
// Comment on how a 'Buy Now' or 'Add to Cart' button for products would transform
// into an 'Initiate Application', 'Request Quote', or 'Book Consultation' button/flow for services.
// Also, comment on how the order/application confirmation or summary screen would
// display information relevant to the `itemType`.

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MarketplaceItem } from "@/lib/types";
import Image from "next/image";
import { MapPin, PackageIcon, Briefcase, CheckCircle, Sparkles, Tag, ShieldCheck, FileText, Link as LinkIcon, Wrench, CalendarDays, CircleDollarSign, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getMarketplaceItemById } from "@/lib/firebase"; // Assuming Firebase functions are used
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AGRICULTURAL_CATEGORIES, type CategoryNode, FINANCIAL_SERVICE_TYPES, INSURANCE_SERVICE_TYPES } from "@/lib/category-data";
import { dummyUsersData } from "@/lib/dummy-data"; // Assuming dummy user data for seller info


// Function to get the category icon (can be reused from marketplace page)
const getCategoryIcon = (category: CategoryNode['id']) => {
  const catNode = AGRICULTURAL_CATEGORIES.find(c => c.id === category);
  const IconComponent = catNode?.icon || Sparkles; // Fallback icon
  return <IconComponent className="h-3 w-3 mr-1 inline-block" />;
}

// Function to get the category name (can be reused from marketplace page)
const getCategoryName = (categoryId: CategoryNode['id']) => {
  return AGRICULTURAL_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
}


export default function MarketplaceItemDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to control the application form modal visibility
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedItem = await getMarketplaceItemById(id); // Fetch item from Firebase
        if (fetchedItem) {
          setItem(fetchedItem as MarketplaceItem); // Cast to MarketplaceItem
        } else {
          setItem(null); // Item not found
        }
      } catch (err) {
        console.error("Error fetching marketplace item:", err);
        setError("Failed to load listing.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }

  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
         <Skeleton className="h-8 w-48" />
         <Card className="max-w-4xl mx-auto">
          <Skeleton className="w-full aspect-video rounded-t-lg" />
           <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
           </CardHeader>
           <CardContent className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
           </CardContent>
           <CardFooter>
              <Skeleton className="h-10 w-full" />
           </CardFooter>
         </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  if (!item) {
    notFound(); // Renders Next.js 404 page
  }

  const seller = dummyUsersData[item.sellerId] || { name: "Unknown Seller", avatarUrl: "https://placehold.co/40x40.png" }; // Get seller info from dummy data

  // Conceptual: Determine the call-to-action based on listingType
  let callToActionText = "View Details"; // Default
  let callToActionVariant: "default" | "outline" | "destructive" = "default";
  let callToActionLink = `#contact-seller`; // Default scroll link
  let showContactSellerButton = true; // Default to show contact button

  // Comments illustrating the dynamic Call to Action based on listingType
  // For 'Product': Standard purchase flow initiation
  if (item.listingType === 'Product') {
    callToActionText = "Inquire or Place Order";
    // Conceptual: Link to a simplified order initiation flow or just contact
    // A full 'Add to Cart' / 'Buy Now' flow would be more complex and handle variants, quantity etc.
    // For now, clicking could open a modal or link to a contact form/chat.
    callToActionLink = `#inquire-order`; // Scroll to contact/inquiry section
    callToActionVariant = "default";
    // Conceptual: If integrated ordering exists, this button could initiate that
    // comment: Button onClick={handleInitiateOrder}
  }
  // For 'Service': Action depends on the specific service type
  else if (item.listingType === 'Service') {
     // Conceptual: Based on item.serviceType
     switch(item.serviceType) {
        case 'financial_service':
        case 'insurance_service': // If service type is financial or insurance
           callToActionText = "Initiate Application";
           // Conceptual: Link to the Financial Hub application flow, passing item.id
           // comment: callToActionLink = `/financial-hub/apply?serviceId=${item.id}`;
           callToActionLink = `#initiate-service`; // Placeholder for now
           callToActionVariant = "default";
           showContactSellerButton = false; // Application flow might replace direct contact initially
           break;
        case 'logistics':
 // Conceptual: Integration with Financial Hub for services like Financial/Insurance
 // When the listingType is 'Service' and serviceType is 'financial_service' or 'insurance_service',
 // the primary call to action is to "Initiate Application".
 // Clicking this button would conceptually trigger a process to create a new entry
 // in a conceptual `applications` collection (or similar data structure managed by the Financial Hub).
 // This involves presenting a basic digital application form to the user first.
 // This form's fields would correspond to the conceptual `applications` schema (defined in src/lib/schemas.ts).
 // Key input fields on this form would likely include:
 // - Requested Amount (if applicable to the financial/insurance product)
 // - Consent Checkboxes (e.g., consent to share data, consent to terms and conditions - the `consentGivenForDataSharing` field is a placeholder for a later phase).
 // - Basic contact information confirmation (auto-populated from user profile).
 // - Any other specific information required by the product's `eligibilityCriteria` or `terms`.
 // Submitting this form would then populate the `applications` collection in Firestore.
 // The data passed to this process would likely include the `listingId` (item.id),
 // the `relatedFinancialProductId` (if the listing links to a specific financial product),
 // the `buyerId` (current user), and other relevant details from the listing and the form inputs.
 // The new application entry would be linked back to a potential `marketplace_orders`
 // record via the `relatedApplicationId` field (as defined in the conceptual schema).
 // This action conceptually integrates with the Financial & Insurance Services Hub and initiates the application tracking process.

 // Conceptual: Integration with Financial Hub for services like Financial/Insurance
 // When the listingType is 'Service' and serviceType is 'financial_service' or 'insurance_service',
 // the primary call to action is to "Initiate Application".
 // Clicking this button would conceptually trigger a process to create a new entry
 // in a conceptual `applications` collection (or similar data structure managed by the Financial Hub).
 // The data passed to this process would likely include the `listingId` (item.id),
 // the `relatedFinancialProductId` (if the listing links to a specific financial product),
 // the `buyerId` (current user), and other relevant details from the listing.
 // The new application entry would be linked back to a potential `marketplace_orders`
 // record via the `relatedApplicationId` field (as defined in the conceptual schema).
 // This action conceptually integrates with the Financial & Insurance Services Hub.
        case 'agronomy_consulting':
        case 'technical_repair_services':
        case 'equipment-rental-operation': // Assuming this can also be a service
           callToActionText = item.availabilityStatus === 'Available' ? "Request Quote or Book" : "Inquire Availability";
           // Conceptual: Link to a specific booking/quote request flow, or just contact
           // comment: callToActionLink = `/services/book?serviceId=${item.id}`;
           callToActionLink = `#inquire-order`; // Scroll to contact/inquiry section
           callToActionVariant = "default";
           break;
        case 'land-services': // E.g., land lease
            callToActionText = "Inquire About Terms";
             callToActionLink = `#inquire-order`; // Scroll to contact/inquiry section
             callToActionVariant = "default";
            break;
        // Add other service types
        default:
           callToActionText = "Inquire About Service";
           callToActionLink = `#inquire-order`; // Scroll to contact/inquiry section
           callToActionVariant = "default";
           break;
     }
     // Conceptual: If a service requires a formal application/booking, the primary button initiates that.
     // Direct messaging might still be available but less prominent initially.
  }


  // Conceptual: Order/Application Confirmation or Summary Screen Display
  // When an 'order' (for product) or 'initiation' (for service application/booking) occurs,
  // the subsequent confirmation or summary screen would display information relevant to the `itemType`.
  // E.g.,
  // If itemType is 'physical_product': Display order summary, quantity, total price, estimated delivery.
  // If itemType is 'financial_service_application': Display application status, required documents, next steps in the application process.
  // If itemType is 'consultation_booking': Display confirmed date/time, consultant details, meeting link (if online).
  // This part would be in a separate order/application confirmation page or modal.
  // The structure would depend on the `itemType` field added in the conceptual `marketplace_orders` schema.


  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> Back to Marketplace
      </Link>

      <Card className="max-w-4xl mx-auto overflow-hidden">
        <div className="relative w-full aspect-video">
          <Image
            src={item.imageUrl || "https://placehold.co/800x450.png"}
            alt={item.name}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
            style={{ objectFit: "cover" }}
             data-ai-hint={item.dataAiHint || `${item.listingType.toLowerCase()} agricultural`}
          />
           <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
               <Badge variant="secondary" className="py-1 px-2 text-sm flex items-center capitalize shadow-sm">
                {item.listingType === 'Product' ? <PackageIcon className="h-4 w-4 mr-1" /> : <Briefcase className="h-4 w-4 mr-1" />}
                 {item.listingType}
               </Badge>
               {item.isSustainable && item.listingType === 'Product' && (
                 <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-sm shadow-sm">
                   <CheckCircle className="h-4 w-4 mr-1" />Sustainable
                 </Badge>
               )}
            </div>
        </div>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{item.name}</CardTitle>
          <CardDescription className="text-lg text-primary flex items-center">
             <Badge variant="outline" className="text-sm w-fit py-1 px-2 flex items-center capitalize mr-2">
              {getCategoryIcon(item.category)} {getCategoryName(item.category)}
            </Badge>
            {item.listingType === 'Product' ? (
               <>
                {item.price ? `$${item.price.toFixed(2)}` : 'Price Inquire'}
                {item.perUnit && <span className="text-base text-muted-foreground font-normal ml-1.5">{item.perUnit}</span>}
               </>
            ) : (
              item.compensation && <span className="text-base font-medium">{item.compensation}</span>
            )}
          </CardDescription>
           {item.aiPriceSuggestion && item.listingType === 'Product' && (
             <div className="text-sm text-blue-600 flex items-center mt-2">
               <Sparkles className="h-4 w-4 mr-1" />
               AI Price Est: ${item.aiPriceSuggestion.min} - ${item.aiPriceSuggestion.max} ({item.aiPriceSuggestion.confidence})
             </div>
           )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <span>{item.location}</span>
          </div>

           {/* Conceptual: Display Seller Reputation Summary */}
           {/* Add a placeholder or component here to show seller reputation, e.g., rating or link to profile */}
           {/* <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Seller: <Link href={`/profiles/${item.sellerId}`} className="text-primary hover:underline">{seller.name}</Link></span>
               {/* Conceptual: Add seller rating/verification badge here */}
               {/* <Badge variant="secondary" className="ml-2 text-xs">Rating: 4.8/5</Badge> */}
                {/*item.sellerVerification === 'Verified' && (
                   <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-600">
                       <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                   </Badge>
                 )*/}
           {/* </div> */}
           {/* End Conceptual Seller Reputation */}


          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>

           {/* Conditional Fields based on Listing Type - More detailed */}
           {item.listingType === 'Product' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <h4 className="text-md font-semibold flex items-center gap-1.5"><PackageIcon className="h-4 w-4 text-muted-foreground"/>Product Details</h4>
                    <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                       {item.quantity && <li>Quantity Available: {item.quantity} {item.unit || ''}</li>}
                       {item.price && <li>Price: ${item.price.toFixed(2)} {item.currency} {item.perUnit}</li>}
                       {item.harvestDate && <li>Harvest Date: {new Date(item.harvestDate).toLocaleDateString()}</li>}
                       {item.isSustainable && <li>Sustainable Product: Yes</li>}
                       {item.certifications && item.certifications.length > 0 && (
                           <li>Certifications: {item.certifications.join(', ')}</li>
                       )}
                       {item.minimumOrderQuantity && <li>Min Order: {item.minimumOrderQuantity}</li>}
                    </ul>
                 </div>
                  {/* Conceptual: Link to Traceability */}
                  {item.relatedTraceabilityId && (
                      <div className="space-y-2">
                         <h4 className="text-md font-semibold flex items-center gap-1.5"><Tag className="h-4 w-4 text-muted-foreground"/>Traceability</h4>
                         <p className="text-sm text-muted-foreground">This product is linked to a traceable batch.</p>
                         {/* comment: <Button variant="outline" size="sm" asChild><Link href={`/traceability/${item.relatedTraceabilityId}`}>View Traceability History</Link></Button> */}
                         <Button variant="outline" size="sm">View Traceability History (Coming Soon)</Button>
                      </div>

                      {/* Conceptual: Usage of relatedTraceabilityId */}
                      {/* The `item.relatedTraceabilityId` field from the fetched `MarketplaceItem` data is used here. */}
                      {/* If this field exists, it indicates the product is linked to a specific batch. */}
                      {/* A button or link labeled 'View Traceability History' is displayed. */}
                      {/* Clicking this button would conceptually fetch and display the traceability events */}
                      {/* associated with this `relatedTraceabilityId` (which corresponds to a batch ID). */}
                  )}
                  {/* End Conceptual Traceability */}
             </div>
           )}

           {item.listingType === 'Service' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-md font-semibold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground"/>Service Details</h4>
                   <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                      {item.serviceType && <li>Service Type: <span className="capitalize">{item.serviceType.replace(/_/g, ' ')}</span></li>}
                       {item.priceDisplay && <li>Pricing: {item.priceDisplay}</li>}
                      {item.compensation && <li>Compensation/Rate: {item.compensation}</li>} {/* Use compensation field as fallback/alternative */}
                      {item.availabilityStatus && <li>Availability: {item.availabilityStatus}</li>}
                       {item.serviceArea && <li>Service Area: {item.serviceArea}</li>}
                       {item.experienceLevel && <li>Experience Level: {item.experienceLevel}</li>}
                   </ul>
                </div>
                 {item.skillsRequired && item.skillsRequired.length > 0 && (
                      <div className="space-y-2">
                          <h4 className="text-md font-semibold flex items-center gap-1.5"><Wrench className="h-4 w-4 text-muted-foreground"/>Skills / Keywords</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.skillsRequired.map(skill => <Badge key={skill} variant="secondary" className="text-sm py-0.5 px-2">{skill}</Badge>)}
                          </div>
                      </div>
                    )}
                {/* Conceptual: Link to detailed service/financial product info if applicable */}
                 {(item.relatedServiceDetailId || item.relatedFinancialProductId) && (
                     <div className="space-y-2">
                         <h4 className="text-md font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground"/>Additional Information</h4>
                         {/* comment: <Button variant="outline" size="sm" asChild><Link href={`/services/${item.relatedServiceDetailId || item.relatedFinancialProductId}`}>View Service Details</Link></Button> */}
                         <Button variant="outline" size="sm">View Service Details (Coming Soon)</Button>
                     </div>
                 )}
                {/* End Conceptual Service Link */}
             </div>
           )}
            {/* End Conditional Fields */}

          <Separator />

           {item.imageUrl && (
             <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-1.5"><LinkIcon className="h-4 w-4 text-muted-foreground"/>Listing Media</h3>
                 <p className="text-sm text-muted-foreground">Image provided for the listing.</p>
                {/* Display the main image again or link to a gallery if multiple images were supported */}
                 {/* <Image src={item.imageUrl} alt={item.name} width={400} height={300} className="rounded-md object-cover"/> */}
            </div>
           )}

          <div className="space-y-2" id="inquire-order">
            <h3 className="text-lg font-semibold flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-muted-foreground"/>Contact & Next Steps</h3>
            <p className="text-muted-foreground text-sm">{item.contactInfo}</p>
             {/* Conceptual: Call to Action Button based on listingType */}
              <Button className="w-full md:w-auto mt-4" variant={callToActionVariant} asChild>
                 {/* Conceptual: The `href` here would change based on the action - e.g., a link to /financial-hub/apply or a function call for a modal */}
                <Link href={callToActionLink}>
                  {/* Conceptual: Icons could change based on the action type */}
                   {item.listingType === 'Product' && <ShoppingBag className="mr-2 h-4 w-4"/>}
                   {item.listingType === 'Service' && item.serviceType === 'financial_service' && <CircleDollarSign className="mr-2 h-4 w-4"/>}
                   {item.listingType === 'Service' && item.serviceType !== 'financial_service' && <Briefcase className="mr-2 h-4 w-4"/>}
                   {callToActionText}
                </Link>
              </Button>

              {/* Conceptual UI for Financial/Insurance Application Form */}
              {/* This section illustrates the form that would appear when a user clicks 'Initiate Application' */}
              {/* on a financial or insurance service listing. It could be a modal or a new page. */}
              {/* The fields here conceptually map to the `applications` schema defined in src/lib/schemas.ts */}
               {(item.listingType === 'Service' && (FINANCIAL_SERVICE_TYPES.includes(item.serviceType as any) || INSURANCE_SERVICE_TYPES.includes(item.serviceType as any))) && (
                   <>
                    {/* Conceptual Button to Trigger Modal/Page */}
                    {/* comment: onClick={() => setShowApplicationForm(true)} */}
                     <Button className="w-full md:w-auto mt-4" variant={callToActionVariant}>
                       {/* Conceptual: Icons could change based on the action type */}
                       {(item.serviceType === 'financial_service' || item.serviceType === 'insurance_service') && <CircleDollarSign className="mr-2 h-4 w-4"/>}
                       {callToActionText}
                    </Button>

                    {/* Conceptual Modal/Page for Application Form */}
                     {/* comment: {showApplicationForm && ( */}
                     {/* comment: <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> */}
                     {/* comment: <Card className="w-full max-w-md"> */}
                      <Card className="w-full max-w-md mt-8 mx-auto" id="conceptual-application-form">
                         <CardHeader>
                           <CardTitle>Apply for {item.name}</CardTitle>
                           <CardDescription>Please provide the required details to initiate your application.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                           {/* Input field for requested amount (if applicable) */}
                           {/* comment: <div className="space-y-2"> */}
                           {/* comment: <label htmlFor="requestedAmount" className="block text-sm font-medium text-muted-foreground">Requested Amount (Optional)</label> */}
                           {/* comment: <Input id="requestedAmount" type="number" placeholder="$" /> */}
                           {/* comment: </div> */}
                            <div className="space-y-2">
                                <label htmlFor="requestedAmount" className="block text-sm font-medium text-muted-foreground">Requested Amount (Optional)</label>
                                <input type="number" id="requestedAmount" placeholder="$" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                           </div>

                           {/* Conceptual Checkboxes for consentGivenForDataSharing */}
                           {/* These checkboxes are CRITICAL for the data-driven trust model. */}
                           <div className="space-y-3 border p-4 rounded-md">
                                <h5 className="text-base font-semibold mb-2">Consent to Share Data (Optional)</h5>
                                <p className="text-sm text-muted-foreground">Sharing data can potentially improve your application outcomes.</p>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="consentFarmData" className="h-4 w-4 text-primary rounded" />
                                     <label htmlFor="consentFarmData" className="text-sm font-medium leading-none">Share my farm production data</label>
                                     <span className="text-xs text-muted-foreground">(Yields, inputs, etc.)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="consentSalesHistory" className="h-4 w-4 text-primary rounded" />
                                     <label htmlFor="consentSalesHistory" className="text-sm font-medium leading-none">Share my Marketplace sales history</label>
                                     <span className="text-xs text-muted-foreground">(Completed transactions on DamDoh)</span>
                                </div>
                                {/* Add other consent types as needed, referencing the applications schema */}
                                {/* e.g., traceabilityReports, carbonFootprintData */}
                               {/* comment: <div className="flex items-center space-x-2"> */}
                               {/* comment: <input type="checkbox" id="consentTraceability" className="h-4 w-4 text-primary rounded" /> */}
                               {/* comment: <label htmlFor="consentTraceability" className="text-sm font-medium leading-none">Share my traceability reports</label> */}
                               {/* comment: <span className="text-xs text-muted-foreground">(Batch histories)</span> */}
                               {/* comment: </div> */}
                           </div>

                           {/* Conceptual Submit Button */}
                           {/* comment: <Button className="w-full">Submit Application</Button> */}
                           {/* comment: </CardContent> */}
                           {/* comment: </Card> */}
                           {/* comment: </div> */}
                           {/* comment: )} */}
                            <Button className="w-full">Submit Application (Conceptual - Populates Applications Collection)</Button>
                         </CardContent>
                      </Card>
                   </>
               )}
              {/* End Conceptual Application Form */}

              {/* Conceptual: Optional 'Contact Seller' button if not covered by primary CTA */}
              {showContactSellerButton && (
                 <Button variant="outline" className="w-full md:w-auto md:ml-2 mt-2 md:mt-4" asChild>
                   {/* Conceptual: Link to the messaging feature, pre-selecting the seller */}
                   <Link href={`/messages?with=${item.sellerId}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Contact Seller
                   </Link>
                 </Button>
              )}
              {/* End Conceptual Call to Action */}

              {/* Conceptual: Button to initiate a direct chat with the seller */}
              {/* This button allows a buyer to directly message the seller of the listing. */}
              {/* Clicking this button would conceptually navigate the user to the messaging interface. */}
              {/* The navigation should ideally include parameters to identify the seller (`item.sellerId`) */}
              {/* and potentially the listing being discussed, allowing the messaging interface */}
              {/* to either open an existing chat thread or start a new one with the seller. */}
              {/* For now, linking to the messages page with a query parameter is a conceptual placeholder. */}
              <Button variant="outline" className="w-full md:w-auto md:ml-2 mt-2 md:mt-4" asChild>
                {/* Conceptual: Link to the messaging feature, pre-selecting the seller */}
                <Link href={`/messages?with=${item.sellerId}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Contact Seller
                </Link>
              </Button>

          </div>

           {/* Conceptual: Reviews Section */}
           {/* Add a section here to display reviews for this listing */}
            {/*
            {/*
            // Conceptual: Reviews Section
            // This section displays user reviews for the listing, regardless of whether it's a Product or a Service.
            // The reviews data would be fetched based on the `listingId`.
            // Data structure for reviews is conceptually defined in src/lib/schemas.ts and src/lib/types.ts.
            /*}
            <Separator />
             <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reviews</h3>
                 {/* Placeholder for review list */}
                 {/*
                 // Conceptual: List of Reviews
                 // Map over fetched review data (`reviews: Review[]`) to display each review item.
                 // <ReviewItem key={review.reviewId} review={review} />  (Assuming a ReviewItem component)
                 */}
                 <div className="text-muted-foreground text-sm">No reviews yet.</div> {/* Placeholder if no reviews */}
                 {/* Conceptual: Add a button for authenticated users to leave a review after purchase/service completion */}
                 {/* <Button variant="outline">Leave a Review (After Transaction)</Button> */}
            {/* </div> */}
           {/* End Conceptual Reviews */}

        </CardContent>
        <CardFooter className="flex justify-end">
           {/* Conceptual: Link back to marketplace or seller profile */}
             <Link href={`/profiles/${item.sellerId}`} className="text-sm text-muted-foreground hover:underline">View Seller Profile</Link>
        </CardFooter>
      </Card>
    </div>
  );
}