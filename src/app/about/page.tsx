import { Metadata } from "next";
import {
  getHeroSection,
  getMission,
  getTeamMembers,
  getCoreValues,
} from "@/lib/contentful";
import { PageHero } from "@/components/sections/PageHero";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { CoreValues } from "@/components/sections/CoreValues";
import type { ContentfulEntry } from "@/types/contentful";

interface HeroFields {
  heading?: string;
  description?: string;
  heroImage?: { fields?: { file?: { url?: string } } };
}

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Ateed Tech - your dedicated technology partner committed to bringing your unique visions to life through custom software development.",
  alternates: { canonical: "/about" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function AboutPage() {
  const [heroData, missionData, teamData, valuesData] = await Promise.all([
    getHeroSection("AboutUs"),
    getMission("About"),
    getTeamMembers(),
    getCoreValues(),
  ]);

  const hero = heroData[0] as unknown as
    | ContentfulEntry<HeroFields>
    | undefined;
  const heroImageUrl = hero?.fields?.heroImage?.fields?.file?.url;
  const backgroundImage = heroImageUrl
    ? heroImageUrl.startsWith("//")
      ? `https:${heroImageUrl}`
      : heroImageUrl
    : undefined;

  return (
    <>
      <PageHero
        heading={hero?.fields?.heading || "About Us"}
        description={hero?.fields?.description || "Learn more about Ateed Tech"}
        backgroundImage={backgroundImage}
        nextSectionId={missionData[0] ? "mission" : undefined}
      />

      {missionData[0] && (
        <Mission
          data={
            missionData[0] as unknown as React.ComponentProps<
              typeof Mission
            >["data"]
          }
        />
      )}

      {valuesData && valuesData.length > 0 && (
        <CoreValues
          data={
            valuesData as unknown as React.ComponentProps<
              typeof CoreValues
            >["data"]
          }
        />
      )}

      {teamData && teamData.length > 0 && (
        <Team
          data={
            teamData as unknown as React.ComponentProps<typeof Team>["data"]
          }
        />
      )}
    </>
  );
}
