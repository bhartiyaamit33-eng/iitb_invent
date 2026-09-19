import { permanentRedirect } from "next/navigation";

/** Old DSSE Day URL. INV.ENT is the conference, not an in-house annual day. */
export default function DsseDayRedirectPage() {
  permanentRedirect("/about");
}
