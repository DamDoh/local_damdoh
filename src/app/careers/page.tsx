
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Sparkles, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const dummyOpenings = [
  {
    id: "job1",
    title: "Lead Agricultural Supply Chain Analyst",
    location: "Remote / Global",
    type: "Full-time",
    description: "Seeking an experienced analyst to optimize supply chain operations, develop data-driven strategies, and support our network of stakeholders. Strong background in agricultural economics and logistics required.",
  },
  {
    id: "job2",
    title: "Community Manager - Farmer Engagement",
    location: "Nairobi, Kenya Hub",
    type: "Full-time",
    description: "Passionate about agriculture and community building? Join us to support and grow our farmer network in East Africa. Excellent communication and field experience needed.",
  },
  {
    id: "job3",
    title: "Senior Full Stack Engineer (Agri-Tech)",
    location: "Remote / Europe Timezones",
    type: "Full-time",
    description: "Develop innovative features for the DamDoh platform. Proficient in Next.js, TypeScript, and backend technologies. Experience with GIS or agricultural data is a plus.",
  }
];

export default function CareersPage() {
  const showOpenings = false; // Set to true to show dummy openings, false for "Coming Soon"

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Briefcase className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">Join Our Mission at DamDoh</CardTitle>
          </div>
          <CardDescription className="text-lg">
            We're building a future where technology and collaboration transform the agricultural supply chain for the better.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>Why Work With Us?</h2>
            <p>
              At DamDoh, you'll be part of a dynamic team passionate about solving real-world challenges in agriculture. We foster a culture of innovation, continuous learning, and impact. If you're driven to make a difference and contribute to a more sustainable and equitable food system, DamDoh is the place for you.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-5 mt-3">
              <li>Meaningful work that directly impacts global food security.</li>
              <li>Collaborative and inclusive team environment.</li>
              <li>Opportunities for professional growth and development.</li>
              <li>Competitive compensation and benefits (Details coming soon).</li>
              <li>Flexible work arrangements for many roles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Current Openings</h2>
            {showOpenings && dummyOpenings.length > 0 ? (
              <div className="space-y-4">
                {dummyOpenings.map(job => (
                  <Card key={job.id}>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>{job.type}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </CardContent>
                    <CardContent className="pt-2">
                      <Button>Apply Now (Placeholder)</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Current Openings (Or Section Coming Soon)</h3>
                <p className="text-muted-foreground max-w-md">
                  We are always looking for talented individuals to join our team. Please check back later for specific job postings, or feel free to send your resume to <a href="mailto:careers@damdoh.org" className="text-primary hover:underline">careers@damdoh.org</a>.
                </p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
