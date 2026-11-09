import type { ResumeTemplateModule } from "./types";
import { classic } from "./classic";
import { sidebar } from "./sidebar";
import { centered } from "./centered";
import { compact } from "./compact";
import { executive } from "./executive";
import { minimal } from "./minimal";
import { ivy } from "./ivy";
import { banner } from "./banner";
import { bold } from "./bold";
import { mono } from "./mono";
import { timeline } from "./timeline";
import { slate } from "./slate";
import { duo } from "./duo";
import { onyx } from "./onyx";
import { ledger } from "./ledger";
import { skyline } from "./skyline";
import { polished } from "./polished";
import { pastel } from "./pastel";
import { splash } from "./splash";
import { noir } from "./noir";
import { elegant } from "./elegant";
import { confetti } from "./confetti";
import { tone } from "./tone";
import { launch } from "./launch";
import { scholar } from "./scholar";
import { metro } from "./metro";
import { bluePhotoTopleft } from "./bluePhotoTopleft";
import { navyPhotoSidebar } from "./navyPhotoSidebar";
import { coralSidebarStylist } from "./coralSidebarStylist";
import { luxuryPhotoGoldBand } from "./luxuryPhotoGoldBand";
import { brownChefPhoto } from "./brownChefPhoto";
import { redBoldPr } from "./redBoldPr";
import { orangeDisplayRealestate } from "./orangeDisplayRealestate";
import { purpleAcademicChevron } from "./purpleAcademicChevron";
import { indigoGeometric } from "./indigoGeometric";
import { creamPhotographerDisplay } from "./creamPhotographerDisplay";
import { elegantSerifTwocol } from "./elegantSerifTwocol";
import { marineNavyBand } from "./marineNavyBand";
import { regentSlateBand } from "./regentSlateBand";
import { clarityTwocol } from "./clarityTwocol";
import { stoneSwiss } from "./stoneSwiss";
import { codeCommentDev } from "./codeCommentDev";
import { classicBorderedName } from "./classicBorderedName";
import { airySerifMinimal } from "./airySerifMinimal";
import { charcoalPlaywrightSerif } from "./charcoalPlaywrightSerif";
import { boldSerifNameplate } from "./boldSerifNameplate";

/**
 * Template registry. To add a template:
 *   1. create `src/templates/<name>.tsx` exporting a ResumeTemplateModule
 *      (compose the building blocks in ./shared.tsx, or roll your own markup)
 *   2. add it to this array
 * The picker, thumbnails, previews, and export all read from here.
 */
export const TEMPLATES: ResumeTemplateModule[] = [
  classic,
  minimal,
  skyline,
  polished,
  executive,
  elegant,
  ivy,
  scholar,
  ledger,
  banner,
  tone,
  bold,
  metro,
  mono,
  timeline,
  launch,
  pastel,
  splash,
  confetti,
  sidebar,
  slate,
  centered,
  duo,
  compact,
  onyx,
  noir,
  bluePhotoTopleft,
  navyPhotoSidebar,
  coralSidebarStylist,
  luxuryPhotoGoldBand,
  brownChefPhoto,
  redBoldPr,
  orangeDisplayRealestate,
  purpleAcademicChevron,
  indigoGeometric,
  creamPhotographerDisplay,
  elegantSerifTwocol,
  marineNavyBand,
  regentSlateBand,
  clarityTwocol,
  stoneSwiss,
  codeCommentDev,
  classicBorderedName,
  airySerifMinimal,
  charcoalPlaywrightSerif,
  boldSerifNameplate,
];

export function getTemplate(id: string): ResumeTemplateModule {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export { PAGE_MIN_HEIGHT, PAGE_WIDTH, atsBand, BAND_META, BAND_ORDER } from "./types";
export type { AtsBand, ResumeTemplateModule, TemplateRenderProps } from "./types";
