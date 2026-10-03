export interface TextBlockProps {
  content: string;
  alignment?: "left" | "center" | "right";
  backgroundColor?: string;
}

export function TextBlock({ content, alignment = "left", backgroundColor = "bg-white" }: TextBlockProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <section className={`py-16 px-6 ${backgroundColor}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`prose prose-lg ${alignmentClasses[alignment]}`}>
          {content}
        </div>
      </div>
    </section>
  );
}
