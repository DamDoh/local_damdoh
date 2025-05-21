
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { TalentListing } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Briefcase, MapPin, CalendarDays, Sparkles, HardHat, Tractor, Users, Leaf } from "lucide-react"; // Added Users, Leaf

// Dummy data for talent listings - agriculture supply chain focus
const talentListings: TalentListing[] = [
  { id: 'talent1', title: 'Supply Chain Manager (Perishables)', description: 'Seeking experienced Supply Chain Manager for our expanding fresh produce export business. Responsibilities include logistics, inventory, and supplier relations. Based in Nairobi.', type: 'Job', listerId: 'kenyaFreshExports', location: 'Nairobi, Kenya', skillsRequired: ['Supply Chain Management', 'Cold Chain Logistics', 'Export Documentation', 'ERP Systems'], compensation: 'Competitive Salary + Benefits', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'talent2', title: 'Organic Farm Certification Consultant', description: 'Offering consultancy services for farms transitioning to organic or seeking certifications (e.g., USDA Organic, EU Organic). Includes audit preparation and documentation support.', type: 'Service', listerId: 'organicGrowthAdvisors', location: 'Remote / Global', skillsRequired: ['Organic Standards (USDA, EU, JAS)', 'Farm Auditing', 'Sustainable Agriculture', 'Documentation'], compensation: 'Project-based or Daily Rate', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'talent3', title: 'Agricultural Loan Officer', description: 'Financial institution seeks an Agricultural Loan Officer to manage a portfolio of agribusiness clients. Experience in credit analysis for farming and processing required.', type: 'Job', listerId: 'agriBankCorp', location: 'Midwest, USA', skillsRequired: ['Agricultural Finance', 'Credit Analysis', 'Client Relationship Management', 'Risk Assessment'], compensation: '$80k - $110k + Bonus', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'talent4', title: 'Food Safety & Quality Assurance Manager', description: 'Food processing company needs a QA Manager to oversee HACCP, GMP, and BRC compliance. Strong leadership and problem-solving skills essential.', type: 'Job', listerId: 'qualityFoodsInc', location: 'Ho Chi Minh City, Vietnam', skillsRequired: ['Food Safety (HACCP, GMP, BRC)', 'Quality Audits', 'Team Leadership', 'Regulatory Compliance'], compensation: 'Negotiable, based on experience', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'talent5', title: 'Custom Drone-Based Crop Scouting Service', description: 'FAA-certified drone pilot offering NDVI analysis, pest detection, and plant health assessments for large-scale farms. Covering [State/Region].', type: 'Service', listerId: 'skyAgroScout', location: 'California, USA', skillsRequired: ['Drone Piloting (Fixed Wing & VTOL)', 'NDVI & Multispectral Analysis', 'GIS Mapping', 'Agronomy Basics'], compensation: 'Per Acre / Per Project', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const listingTypes = ['All', 'Job', 'Service'];
const agriculturalSectors = ['All', 'Farm Production', 'Input Supply', 'Processing & Manufacturing', 'Logistics & Distribution', 'Retail & Food Service', 'Finance & Investment', 'Agri-Tech & Innovation', 'Consulting & Advisory', 'Research & Development', 'Government & NGO'];

export default function TalentExchangePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Agri-Talent & Services Exchange</CardTitle>
              <CardDescription>Discover jobs, specialized services, and skilled professionals across the agricultural supply chain.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/talent-exchange/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Offer Job / List Service
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs or services (e.g., 'agronomist', 'cold storage')" className="pl-10" />
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
                <SelectValue placeholder="Agricultural Sector / Specialty" />
              </SelectTrigger>
              <SelectContent>
                {agriculturalSectors.map(sector => (
                  <SelectItem key={sector} value={sector.toLowerCase().replace(/ & | /g, '-')}>{sector}</SelectItem>
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
                     {listing.type === 'Job' ? <Users className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
                    <span>{listing.type === 'Job' ? 'Opportunity by' : 'Service from'}: <Link href={`/profiles/${listing.listerId}`} className="text-primary hover:underline">{listing.listerId}</Link></span>
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
                      <h4 className="text-xs font-semibold mb-1">Key Skills/Expertise:</h4>
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
                    <Link href={`/talent-exchange/${listing.id}`}>View Details & Connect</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {talentListings.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No talent listings found.</p>
              <p className="text-sm text-muted-foreground">Adjust filters or be the first to list an opportunity or service.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}
