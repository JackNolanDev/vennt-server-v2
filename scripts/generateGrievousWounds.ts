import { fetchGrievousWounds } from "../src/webscraper/grievousWounds";

const path = "./scripts/out/grievous_wounds.json";

const generateGrievousWounds = async () => {
  const abilities = await fetchGrievousWounds();
  // @ts-expect-error Bun is defined by Bun runtime
  await Bun.write(path, JSON.stringify(abilities));
};

generateGrievousWounds();
