"use client";

import { FormBlock, FormBlockProps } from "./FormBlock";

export function ContactBlock(props: Omit<FormBlockProps, "formType">) {
  return <FormBlock {...props} formType="contact" />;
}
