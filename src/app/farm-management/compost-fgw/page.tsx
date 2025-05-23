
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Recycle, ArrowLeft, Leaf, Droplets, Sprout, CheckCircle } from "lucide-react";

export default function CompostFGWPage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Farm Management Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Recycle className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Making Good Compost: Farming God's Way</CardTitle>
          </div>
          <CardDescription>
            A simple guide to creating rich compost to feed your soil and grow healthy plants, following God's principles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              Why Make Compost?
            </h2>
            <p className="text-muted-foreground">
              Compost is like special food for your soil. When your soil is healthy, your plants grow strong and give you a good harvest. Farming God's Way teaches us to use what God has given us to care for the land. Good compost helps:
            </p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
              <li>Make your soil rich and full of life.</li>
              <li>Hold water better, so your plants don't get too thirsty.</li>
              <li>Feed your plants naturally, without buying expensive chemicals.</li>
              <li>Reduce waste on your farm by using leftover plant matter.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              What You Need (Materials)
            </h2>
            <p className="text-muted-foreground mb-2">Gather these things from your farm or home. Think of them as "Greens" (wet stuff) and "Browns" (dry stuff).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-md mb-1">Greens (Wet & Fresh):</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                  <li>Fresh grass clippings or weeds (before they make seeds)</li>
                  <li>Kitchen scraps like vegetable peelings, fruit waste (NO meat, oil, dairy, or cooked oily food)</li>
                  <li>Fresh leaves from trees or plants</li>
                  <li>Animal manure (cow, chicken, goat dung is very good. Don't use dog or cat waste.)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-md mb-1">Browns (Dry & Woody):</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                  <li>Dry leaves and old grass</li>
                  <li>Small twigs and straw</li>
                  <li>Maize stalks or cobs (chopped into small pieces)</li>
                  <li>Torn up old newspaper or plain cardboard (no glossy color or plastic)</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground mt-3"><strong className="font-medium">Also Important:</strong></p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 mt-1 space-y-1 text-sm">
                <li><strong className="font-medium">Water:</strong> To keep the pile moist like a squeezed-out sponge.</li>
                <li><strong className="font-medium">A Good Place:</strong> A flat spot, maybe with some shade.</li>
                <li><strong className="font-medium">(Optional) A Little Good Soil:</strong> To add tiny helpers (microbes) that speed up composting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              How to Build Your Compost Pile (Easy Steps)
            </h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 pl-5">
              <li>
                <strong className="font-medium">Choose your spot:</strong> Find a flat area. If it's too sunny, a little shade helps keep it moist. Make sure you can easily get water to it.
              </li>
              <li>
                <strong className="font-medium">Start with Browns (Dry):</strong> Make the first layer on the ground using dry brown materials. This layer should be about 1 foot (30cm or one ruler length) high. This helps air to get into the pile.
              </li>
              <li>
                <strong className="font-medium">Add Greens (Wet):</strong> Put a layer of green materials on top of the browns. This layer should be about half as thick as the brown layer (around 6 inches or 15cm). If using manure, spread it thinly in this layer.
              </li>
              <li>
                <strong className="font-medium">(Optional) Add a sprinkle of soil:</strong> If you have some good garden soil, sprinkle a very thin layer over the greens. This adds good tiny living things that help make compost.
              </li>
              <li>
                <strong className="font-medium">Add Water:</strong> Sprinkle water over the layers. Make them damp, but not soaking wet. It should feel like a sponge that you have squeezed out.
              </li>
              <li>
                <strong className="font-medium">Repeat the Layers:</strong> Keep adding layers: a thick brown layer, then a thinner green layer, (maybe a tiny bit of soil), and then water. Do this until your pile is about 3 to 4 feet high (about 1 meter, or up to your waist).
              </li>
              <li>
                <strong className="font-medium">Cover Your Pile ("God's Blanket"):</strong> Finish with a layer of brown material on top, like dry grass or straw. This is God's blanket for the pile. It keeps the moisture in and the sun from drying it out too much.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              Taking Care of Your Compost
            </h2>
            <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1">
              <li>
                <strong className="font-medium">Keep it Moist:</strong> Check your pile every few days. If the inside feels dry, add some water and mix it a bit. Remember, damp like a squeezed sponge!
              </li>
              <li>
                <strong className="font-medium">Turn the Pile (Mix it):</strong> After 2 to 4 weeks, the pile might get warm or hot inside. This is a good sign! It means the tiny helpers are working hard. It's good to mix or "turn" the pile. Use a fork or shovel to move the materials from the outside to the inside, and from the inside to the outside. This helps everything break down evenly and quickly. Try to turn it every 1 or 2 weeks if you can.
              </li>
            </ul>
          </section>

           <section>
            <h2 className="text-xl font-semibold mb-2">When is Your Compost Ready?</h2>
            <p className="text-muted-foreground">
              Your compost is ready to use when:
            </p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
              <li>It looks dark brown and crumbly, like rich soil.</li>
              <li>It smells earthy and pleasant (like a forest floor after rain), not like rotting food.</li>
              <li>You can't easily see the original pieces of leaves, grass, or food scraps.</li>
            </ul>
            <p className="text-muted-foreground mt-2">This usually takes a few months (from 2 to 6 months), depending on what you put in, how moist you keep it, and how often you turn it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">How to Use Your Good Compost</h2>
            <p className="text-muted-foreground">
              Once your compost is ready, it's powerful food for your farm!
            </p>
            <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
              <li><strong className="font-medium">Before Planting:</strong> Spread a layer of compost on your garden beds and gently mix it into the top few inches of soil.</li>
              <li><strong className="font-medium">When Planting:</strong> Add a handful of compost to each planting hole for seedlings or seeds.</li>
              <li><strong className="font-medium">Around Plants (Mulch):</strong> Spread a layer around your growing plants (God's blanket) to keep the soil moist, stop weeds, and slowly feed the plants. Don't let it touch the plant stems directly.</li>
            </ul>
          </section>
           <section>
            <h2 className="text-xl font-semibold mb-2">Important Reminders (Farming God's Way):</h2>
             <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
                <li><strong className="font-medium">Do it with high standards:</strong> Take care when building your pile and looking after it. Do everything well, as unto God.</li>
                <li><strong className="font-medium">Use what God provides:</strong> Focus on using materials readily available on your farm or locally. Avoid waste.</li>
                <li><strong className="font-medium">Be faithful and patient:</strong> Good compost takes time. Trust the natural process God designed.</li>
            </ul>
           </section>
        </CardContent>
      </Card>
    </div>
  );
}
