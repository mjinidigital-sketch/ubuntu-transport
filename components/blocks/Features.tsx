export interface FeaturesProps {
  title?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export function Features({ 
  title = "Features", 
  features = [
    { title: "Feature 1", description: "Description for feature 1", icon: "🚀" },
    { title: "Feature 2", description: "Description for feature 2", icon: "⚡" },
    { title: "Feature 3", description: "Description for feature 3", icon: "🎯" },
  ]
}: FeaturesProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              {feature.icon && (
                <div className="text-4xl mb-4">{feature.icon}</div>
              )}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
