
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { TalentListing } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Briefcase, MapPin, CalendarDays, Sparkles, HardHat, Tractor } from "lucide-react";

// Dummy data for talent listings - replace with actual data fetching
const talentListings: TalentListing[] = [
  { id: 'talent1', title: 'Experienced Tractor Operator for Harvest Season', description: 'Seeking a skilled tractor operator for seasonal work (July-October). Must have 5+ years experience with combine harvesters and GPS guidance systems.', type: 'Job', listerId: 'largeScaleFarmInc', location: 'Green Valley, CA', skillsRequired: ['Tractor Operation', 'Combine Harvesting', 'GPS Guidance', 'Field Preparation'], compensation: '$22-28/hour, DOE', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'talent2', title: 'Precision Ag Drone Surveying Services', description: 'Offering professional drone surveying for farms: crop health NDVI analysis, field mapping, and elevation modeling. FAA Part 107 certified pilot.', type: 'Service', listerId: 'agriDroneSolutions', location: 'Remote / Servicing Central TX', skillsRequired: ['Drone Piloting (UAV)', 'Photogrammetry', 'GIS Analysis', 'Crop Scouting'], compensation: 'Project-based (e.g., $X/acre)', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'talent3', title: 'Agricultural Consultant (Organic Transition & Certification)', description: 'Expert advice and hands-on support for farms looking to transition to certified organic practices. Customized transition plans available.', type: 'Service', listerId: 'organicPathConsulting', location: 'Servicing Midwest Region', skillsRequired: ['Organic Certification Standards', 'Soil Science', 'Sustainable Pest Management', 'Crop Rotation Planning'], compensation: 'Consultation fee + project milestones', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'talent4', title: 'Dairy Farm Manager Position Available', description: 'Full-time farm manager needed for a 200-cow dairy operation. Responsibilities include herd health, milking operations, and staff supervision. Competitive salary and housing potentially available.', type: 'Job', listerId: 'willowCreekDairy', location: 'Willow Creek, MT', skillsRequired: ['Dairy Farm Management', 'Livestock Handling', 'Milking Systems', 'Feed Management', 'Budgeting'], compensation: '$75,000 - $90,000/year + benefits', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'talent5', title: 'Custom Harvesting Services (Small Grains)', description: 'Offering custom harvesting for wheat, barley, and oats. Modern equipment, experienced operator. Serving [Region/State].', type: 'Service', listerId: 'harvestersUnited', location: 'Mobile (Covering KS, NE, CO)', skillsRequired: ['Combine Operation', 'Grain Handling', 'Logistics'], compensation: 'Per acre / Per bushel rates', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const listingTypes = ['All', 'Job', 'Service'];
const agriculturalSectors = ['All', 'Crop Production', 'Livestock Management', 'Aquaculture', 'Agri-Tech', 'Consulting', 'Farm Labor', 'Processing'];

export default function TalentExchangePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Talent Exchange</CardTitle>
              <CardDescription>Find agricultural jobs, offer your farming expertise, and discover skilled professionals in the agri-food sector.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/talent-exchange/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Listing
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs, services, or skills (e.g., 'irrigation', 'farm manager')" className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Listing Type (Job/Service)" />
              </SelectTrigger>
              <SelectContent>
                {listingTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Agricultural Sector" />
              </SelectTrigger>
              <SelectContent>
                {agriculturalSectors.map(level => (
                  <SelectItem key={level} value={level.toLowerCase().replace(' ', '-')}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {talentListings.map(listing => (
              <Card key={listing.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/talent-exchange/${listing.id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors">{listing.title}</CardTitle>
                    </Link>
                    <Badge variant={listing.type === 'Job' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      {listing.type === 'Job' ? <Briefcase className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {listing.type}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-1 pt-1">
                     <Tractor className="h-4 w-4" />
                    <span>{listing.type === 'Job' ? 'Job Opportunity' : 'Service Offered'}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> {listing.location}
                  </div>
                  {listing.compensation && (
                    <p className="text-sm font-medium text-primary">{listing.compensation}</p>
                  )}
                  {listing.skillsRequired && listing.skillsRequired.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold mb-1">Skills Required:</h4>
                      <div className="flex flex-wrap gap-1">
                        {listing.skillsRequired.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Posted: {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/talent-exchange/${listing.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {talentListings.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No talent listings found.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new listing.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
