"use client";

import { FormBlock, FormBlockProps } from "./FormBlock";

export function BookingBlock(props: Omit<FormBlockProps, "formType">) {
  return <FormBlock {...props} formType="booking" />;
}
