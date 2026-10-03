"use client";

import { BLOCK_CONFIG, getBlockConfig } from "./blocks/block-config";
import { HeroBlock } from "./blocks/HeroBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { BlogBlock } from "./blocks/BlogBlock";
import { CareerBlock } from "./blocks/CareerBlock";
import { CardBlock } from "./blocks/CardBlock";
import { FormBlock } from "./blocks/FormBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { BookingBlock } from "./blocks/BookingBlock";
import { SubscribeBlock } from "./blocks/SubscribeBlock";
import { FeedbackBlock } from "./blocks/FeedbackBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageText } from "./blocks/ImageText";
import { Pricing } from "./blocks/Pricing";
import { Testimonials } from "./blocks/Testimonials";

// Dynamic block component mapping based on block-config
const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  HeroBlock,
  FeaturesBlock,
  BlogBlock,
  CareerBlock,
  CardBlock,
  FormBlock,
  ContactBlock,
  BookingBlock,
  SubscribeBlock,
  FeedbackBlock,
  TextBlock,
  ImageText,
  Pricing,
  Testimonials,
};

export function BlockRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 border border-dashed border-gray-200 m-4 rounded">
        No sections added yet. Build layouts inside the admin manager workspace.
      </div>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }
        return <Component key={block.id} {...block.props} />;
      })}
    </>
  );
}
