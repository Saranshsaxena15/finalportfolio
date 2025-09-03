"use client";

import { GoogleTagManager } from "@next/third-parties/google";

const GTMWrapper = () => {
  return <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />;
};

export default GTMWrapper;
