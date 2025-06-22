
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, Eye, Heart, Shield } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Info className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">About DamDoh</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Connecting the agricultural supply chain for a thriving people, profit, and planet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/>Our Mission</h2>
            <p>
              To empower every stakeholder in the agricultural value chain through innovative technology, fostering sustainable practices, ensuring food security, and promoting equitable growth. We aim to build a resilient and transparent ecosystem where farmers, traders, and consumers can connect, collaborate, and prosper.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Eye className="h-6 w-6 text-primary"/>Our Vision</h2>
            <p>
              To be the leading digital platform revolutionizing the global agricultural supply chain, creating a future where sustainable agriculture nourishes the world and supports vibrant rural communities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="h-6 w-6 text-primary"/>Our Values</h2>
            <ul className="list-disc list-inside space-y-2 pl-5">
              <li><strong className="text-foreground">Sustainability:</strong> Championing practices that protect our planet for future generations.</li>
              <li><strong className="text-foreground">Collaboration:</strong> Believing in the power of partnership and shared success.</li>
              <li><strong className="text-foreground">Innovation:</strong> Continuously seeking better solutions through technology and creativity.</li>
              <li><strong className="text-foreground">Integrity:</strong> Operating with transparency, honesty, and respect for all.</li>
              <li><strong className="text-foreground">Empowerment:</strong> Providing tools and knowledge to uplift every member of the agricultural community.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Meet the Team</h2>
            <p className="mb-4">
              DamDoh is driven by a passionate team of agricultural experts, technologists, and business leaders dedicated to making a difference. While we are growing, our core team believes in the transformative power of connecting the agricultural world.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="text-center p-4">
                  <Image 
                    src={`https://placehold.co/150x150.png`} 
                    alt={`Team Member ${index + 1}`} 
                    width={120} 
                    height={120} 
                    className="rounded-full mx-auto mb-3 border-2 border-primary"
                    data-ai-hint="team member portrait"
                  />
                  <h3 className="font-semibold text-foreground">Team Member ${index + 1}</h3>
                  <p className="text-sm text-primary">Role/Specialty</p>
                  <p className="text-xs mt-1">Brief bio about expertise and passion for agriculture coming soon.</p>
                </Card>
              ))}
            </div>
             <p className="mt-4 text-center">More detailed team profiles coming soon!</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
