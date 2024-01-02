import { load } from "cheerio";
import { UncompleteEntityAbility } from "vennt-library";
import { GRIEVOUS_WOUNDS_USES } from "./grievousWoundsUses";

const GRIEVOUS_WOUNDS_URL = "https://vennt.fandom.com/wiki/Grievous_Wounds";

export const fetchGrievousWounds = async (): Promise<
  UncompleteEntityAbility[]
> => {
  const abilities: UncompleteEntityAbility[] = [];

  const page = await fetch(GRIEVOUS_WOUNDS_URL);
  const pageText = await page.text();
  const $ = load(pageText);
  const grievousWoundsTitle = $("#mw-content-text > div > h2");
  if (!grievousWoundsTitle.text().includes("List of Grievous Wounds")) {
    throw new Error("Did not find the list of grievous wounds!");
  }
  const list = grievousWoundsTitle.nextAll("p");

  const saveAbility = (name: string, effect: string) => {
    abilities.push({
      name,
      effect,
      custom_fields: {
        cost: { passive: true },
        activation: "Passive",
        path: "Grievous Wound",
      },
      uses: GRIEVOUS_WOUNDS_USES[name],
      active: false,
    });
  };

  let name = "";
  list.each((_, el) => {
    const fullEl = $(el);
    const text = fullEl.text().trim();
    const boldText = fullEl.children("b").first().text().trim();

    if (text.length === 0) {
      return;
    }

    if (text === boldText) {
      name = text;
    } else if (name.length > 0) {
      saveAbility(name, text);
      name = "";
    }
  });

  return abilities;
};
