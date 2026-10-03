export interface PricingProps {
  title?: string;
  plans?: Array<{
    name: string;
    price: string;
    description?: string;
    features: string[];
    ctaText?: string;
    highlighted?: boolean;
  }>;
}

export function Pricing({ 
  title = "Pricing", 
  plans = [
    {
      name: "Basic",
      price: "$9",
      description: "Perfect for individuals",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      ctaText: "Get Started",
    },
    {
      name: "Pro",
      price: "$29",
      description: "Best for small teams",
      features: ["All Basic features", "Feature 4", "Feature 5"],
      ctaText: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For large organizations",
      features: ["All Pro features", "Feature 6", "Feature 7"],
      ctaText: "Contact Sales",
    },
  ]
}: PricingProps) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-lg border-2 ${
                plan.highlighted 
                  ? "border-indigo-500 shadow-xl scale-105" 
                  : "border-gray-200"
              } bg-white`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-black mb-4">{plan.price}</div>
              {plan.description && (
                <p className="text-gray-600 mb-6">{plan.description}</p>
              )}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.ctaText || "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
