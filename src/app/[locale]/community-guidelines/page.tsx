
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageCircle, ThumbsUp, Handshake, Leaf } from "lucide-react";

export default function CommunityGuidelinesPage() {
  const guidelines = [
    { 
      icon: <ThumbsUp className="h-6 w-6 text-primary"/>, 
      title: "Be Respectful and Constructive", 
      description: "Treat all members of the DamDoh community with respect. Engage in constructive discussions, share knowledge positively, and avoid personal attacks, harassment, or hate speech." 
    },
    { 
      icon: <ShieldCheck className="h-6 w-6 text-primary"/>, 
      title: "Maintain Authenticity and Transparency", 
      description: "Represent yourself and your business honestly. Do not impersonate others or provide misleading information in your profile, listings, or communications. Clearly state your role in the supply chain." 
    },
    { 
      icon: <MessageCircle className="h-6 w-6 text-primary"/>, 
      title: "Keep Discussions Relevant", 
      description: "When participating in forums or groups, ensure your contributions are relevant to the topic. Avoid spamming, unsolicited advertising, or off-topic content. Focus on agricultural supply chain matters." 
    },
    { 
      icon: <Handshake className="h-6 w-6 text-primary"/>, 
      title: "Foster Fair and Ethical Trade", 
      description: "Conduct business dealings with integrity. Honor commitments, provide accurate product/service descriptions, and engage in fair pricing. DamDoh promotes ethical trade practices." 
    },
    { 
      icon: <Leaf className="h-6 w-6 text-primary"/>, 
      title: "Promote Sustainable Practices", 
      description: "We encourage discussions and sharing of knowledge related to sustainable and regenerative agriculture. Support initiatives that improve soil health, biodiversity, and food security." 
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">DamDoh Community Guidelines</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Our commitment to fostering a safe, respectful, and productive environment for all agricultural stakeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-muted-foreground">
          <p className="text-center">
            Welcome to DamDoh! By joining our platform, you agree to abide by these guidelines to ensure a positive experience for everyone. Violations may result in content removal, account suspension, or other actions deemed necessary.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map(guideline => (
              <div key={guideline.title} className="flex items-start gap-4 p-4 border rounded-lg shadow-sm bg-card">
                <div className="mt-1">{guideline.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{guideline.title}</h3>
                  <p className="text-sm">{guideline.description}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="pt-4 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">Reporting Violations</h3>
            <p className="mb-3">
              If you encounter content or behavior that violates these guidelines, please report it to our moderation team through the platform's reporting tools or by contacting <a href="mailto:support@damdoh.org" className="text-primary hover:underline">support@damdoh.org</a>.
            </p>
            <p>
              Thank you for helping us build a thriving and trustworthy agricultural supply chain community on DamDoh!
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
