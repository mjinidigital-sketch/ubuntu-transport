import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  BarChart3,
  Lightbulb,
  HandHeart,
  Users2,
  Shield,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "We prioritize our customers&apos; needs in every decision we make. Your success is our success.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push boundaries and explore new possibilities to deliver cutting-edge solutions.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We believe in transparency, honesty, and ethical conduct in all our interactions.",
  },
  {
    icon: BarChart3,
    title: "Excellence",
    description:
      "We strive for excellence in everything we do, from product development to customer support.",
  },
  {
    icon: Users2,
    title: "Collaboration",
    description:
      "We work together across teams and with our clients to create better outcomes for everyone.",
  },
  {
    icon: HandHeart,
    title: "Social Responsibility",
    description:
      "We&apos;re committed to making a positive impact on communities and the environment.",
  },
];

export default function AboutSectionValues() {
  return (
    <section className="container mx-auto space-y-8 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold">Our Core Values</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          These principles guide everything we do, from how we develop our
          products to how we interact with our customers and each other.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <Card key={value.title} className="border-l-primary border-l-4 p-0">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <value.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{value.title}</h3>
              </div>
              <p className="text-muted-foreground">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8 text-center">
        <p className="text-muted-foreground mx-auto max-w-2xl">
          These values aren&apos;t just words on our website—they&apos;re lived
          every day by our team members and reflected in the work we deliver.
        </p>
      </div>
    </section>
  );
}
