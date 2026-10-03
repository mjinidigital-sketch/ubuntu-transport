import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Building,
  FolderArchive,
  Globe,
  Users,
  Lightbulb,
  Clock,
  Target,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "15,000+",
    label: "Clients worldwide",
    description: "Trusted by businesses of all sizes across the globe.",
  },
  {
    icon: Award,
    value: "200+",
    label: "Industry awards",
    description: "Recognized excellence in design and implementation.",
  },
  {
    icon: Building,
    value: "18",
    label: "Global offices",
    description: "Local teams providing personalized service worldwide.",
  },
  {
    icon: FolderArchive,
    value: "5,000+",
    label: "Projects completed",
    description: "Successful implementations across diverse industries.",
  },
  {
    icon: Globe,
    value: "43",
    label: "Countries served",
    description: "Supporting clients with international presence.",
  },
  {
    icon: Lightbulb,
    value: "120+",
    label: "Innovation patents",
    description: "Constantly developing new solutions and technologies.",
  },
  {
    icon: Clock,
    value: "13 years",
    label: "Industry experience",
    description: "Deep expertise in evolving digital landscapes.",
  },
  {
    icon: Target,
    value: "99.9%",
    label: "Uptime guarantee",
    description: "Reliable service you can count on around the clock.",
  },
];

export default function AboutSectionStatsGrid() {
  return (
    <section className="container mx-auto space-y-10 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="bg-primary/10 text-primary inline-block rounded-lg px-3 py-1 text-sm">
          Our Impact
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          The numbers speak for themselves
        </h2>
        <p className="text-muted-foreground">
          For over a decade, we&apos;ve been delivering exceptional results and
          building lasting relationships with clients around the world.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden p-0">
            <CardContent className="p-6">
              <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-md">
                <stat.icon className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="font-medium">{stat.label}</p>
                <p className="text-muted-foreground text-sm">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-accent mt-12 rounded-lg p-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-2xl font-bold">Our mission continues</h3>
            <p className="text-muted-foreground mb-4">
              While we&apos;re proud of these achievements, we&apos;re always
              looking forward. Our team remains committed to innovation,
              quality, and delivering exceptional value to every client we
              serve.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded p-4 text-center">
              <p className="text-3xl font-bold">96%</p>
              <p className="text-muted-foreground text-sm">
                Client satisfaction
              </p>
            </div>
            <div className="bg-background rounded p-4 text-center">
              <p className="text-3xl font-bold">82%</p>
              <p className="text-muted-foreground text-sm">Referral rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
