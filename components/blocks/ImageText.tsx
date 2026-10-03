export interface ImageTextProps {
  title: string;
  content: string;
  imageUrl?: string;
  imagePosition?: "left" | "right";
  ctaText?: string;
  ctaLink?: string;
}

export function ImageText({ title, content, imageUrl, imagePosition = "left", ctaText, ctaLink }: ImageTextProps) {
  const isImageLeft = imagePosition === "left";

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col md:flex-row items-center gap-12 ${isImageLeft ? "" : "md:flex-row-reverse"}`}>
          <div className="flex-1">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="rounded-lg shadow-lg w-full"
              />
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Image placeholder</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{content}</p>
            {ctaText && (
              <a 
                href={ctaLink || "#"}
                className="inline-block bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
