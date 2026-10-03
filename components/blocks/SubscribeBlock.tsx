"use client";

import { FormBlock, FormBlockProps } from "./FormBlock";

export function SubscribeBlock(props: Omit<FormBlockProps, "formType">) {
  return <FormBlock {...props} formType="subscribe" layout={props.layout || "banner"} />;
}
