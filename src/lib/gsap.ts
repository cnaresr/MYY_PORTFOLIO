import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Only the core runtime, `useGSAP` and ScrollTrigger are used anywhere in this
 * project, so only those are registered and re-exported. Importing the rest of
 * the plugin catalogue here pulled every one of them into the client bundle
 * even though nothing referenced them.
 *
 * Need another plugin? Import and register it in the component that uses it.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, useGSAP, ScrollTrigger };
