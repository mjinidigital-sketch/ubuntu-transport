"use client";

import { FormBlock, FormBlockProps } from "./FormBlock";

export function FeedbackBlock(props: Omit<FormBlockProps, "formType">) {
  return <FormBlock {...props} formType="feedback" layout={props.layout || "card"} />;
}
