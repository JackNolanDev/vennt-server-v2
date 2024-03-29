import {
  EntityAbilityFieldsStrings,
  PathDetails,
  PathsAndAbilities as PathsAndAbilities,
  UncompleteEntityAbility,
  parseActivationCostMap,
} from "vennt-library";
import { load } from "cheerio";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { cleanQuotes, sleep } from "./webscraperUtils";
import { addProgrammaticUses } from "./abilitiesProgrammaticUses";
import { REPEATABLE_SIGNIFIERS, ABILITY_USES } from "./abilitiesUses/uses";
import { ResultError, throwErrorResult } from "../utils/db";

const LIST_OF_PATHS = "https://vennt.fandom.com/wiki/List_of_Paths";
const BASE_URL = "https://vennt.fandom.com";

const FETCH_ERROR_START = "fetch: ";

const fetchPathUrls = async (): Promise<Set<string>> => {
  const pathUrls = new Set<string>();
  const page = await fetch(LIST_OF_PATHS);
  const pageText = await page.text();
  const $ = load(pageText);
  const links = $("#mw-content-text a");
  links.each((_, el) => {
    if (
      el.attribs.href &&
      el.attribs.title &&
      el.attribs.title.includes("Path of the")
    ) {
      // add to set to dedupe
      pathUrls.add(BASE_URL + el.attribs.href);
    }
  });
  return pathUrls;
};

const parseSimplePathLine = (
  field: keyof PathDetails
): ((text: string, path: PathDetails) => void) => {
  return (text: string, path: PathDetails): void => {
    const labelEnd = ": ";
    const idx = text.indexOf(labelEnd);
    path[field] = text.substring(idx + labelEnd.length);
  };
};

const parsePathLine: Record<string, (text: string, path: PathDetails) => void> =
  {
    "Requirements:": parseSimplePathLine("reqs"),
    "Prerequisite:": parseSimplePathLine("reqs"),
    "Path Completion Bonus:": parseSimplePathLine("completionBonus"),
  };

const parseSimpleAbilityLine = (
  field: keyof EntityAbilityFieldsStrings
): ((text: string, ability: UncompleteEntityAbility) => void) => {
  return (text: string, ability: UncompleteEntityAbility): void => {
    const labelEnd = ": ";
    const idx = text.indexOf(labelEnd);
    if (ability.custom_fields && idx >= 0) {
      ability.custom_fields[field] = text.substring(idx + labelEnd.length);
    }
  };
};

const parseNotReq = (_: string, ability: UncompleteEntityAbility): void => {
  if (ability.custom_fields) {
    ability.custom_fields.not_req = true;
  }
};

const parseTripleText = (text: string): number[] | null => {
  const tripleRegex = /\[\s(-?\d+)\s\/\s(-?\d+)\s\/\s(-?\d+)\s\]/;
  const match = text.match(tripleRegex) || [];
  if (match.length >= 4) {
    return match.slice(1, 4).map((str) => parseInt(str));
  }
  return null;
};

const parseTriple = (
  field: "mp_cost" | "cast_dl"
): ((text: string, ability: UncompleteEntityAbility) => void) => {
  return (text: string, ability: UncompleteEntityAbility): void => {
    const numbers = parseTripleText(text);
    if (numbers && ability.custom_fields) {
      ability.custom_fields[field] = numbers;
    }
  };
};

export const parseActivation = (
  text: string,
  ability: UncompleteEntityAbility
): void => {
  parseSimpleAbilityLine("activation")(text, ability);
  if (!ability.custom_fields) {
    ability.custom_fields = {};
  }
  const { cost, spellCost } = parseActivationCostMap(text);
  ability.custom_fields.cost = {
    ...ability.custom_fields.cost,
    ...cost,
  };
  if (spellCost) {
    ability.custom_fields.spell_cost = spellCost;
  }
};

const parseAbilityLine: Record<
  string,
  (text: string, ability: UncompleteEntityAbility) => void
> = {
  "Cost:": parseSimpleAbilityLine("purchase"),
  "Expedited for:": parseSimpleAbilityLine("expedited"),
  "Unlocks:": parseSimpleAbilityLine("unlocks"),
  "Partially Unlocks:": parseSimpleAbilityLine("partial_unlocks"),
  "DC:": parseSimpleAbilityLine("build_dc"),
  "Build time:": parseSimpleAbilityLine("build_time"),
  "Range:": parseSimpleAbilityLine("range"),
  Prereq: parseSimpleAbilityLine("prereq"),
  "This ability is not required for the Path Completion Bonus": parseNotReq,
  "MP Cost:": parseTriple("mp_cost"),
  "Casting DL:": parseTriple("cast_dl"),
  "Activation:": parseActivation,
};

const abilitySecondLines = ["This ability", "Cost", "Prereq", "Unlock"];
const addToDescTags = new Set(["ul", "ol", "table"]);

const addSpellMaintenanceCost = (
  ability: UncompleteEntityAbility,
  lowerCaseEffect: string
): void => {
  const regex = /lasts while maintained (?:using|as) (?<cost>.*?)\./i;
  const match = lowerCaseEffect.match(regex);
  if (match && match.groups?.cost && ability.custom_fields) {
    const { cost } = parseActivationCostMap(match.groups?.cost);
    ability.custom_fields.spell_maintenance_cost = cost;
  }
};

const addSpecialAbilityDetails = (
  ability: UncompleteEntityAbility,
  markdown: NodeHtmlMarkdown
): UncompleteEntityAbility => {
  ability.effect = markdown.translate(ability.effect);
  if (!ability.custom_fields) {
    ability.custom_fields = {};
  }
  if (!ability.custom_fields.activation) {
    ability.custom_fields.activation = "Passive";
    if (ability.custom_fields.cost) {
      ability.custom_fields.cost.passive = true;
    } else {
      ability.custom_fields.cost = { passive: true };
    }
  }
  const lowerCaseEffect = ability.effect.toLowerCase();
  if (
    REPEATABLE_SIGNIFIERS.some((signifier) =>
      lowerCaseEffect.includes(signifier)
    )
  ) {
    ability.custom_fields.repeatable = true;
  }
  addSpellMaintenanceCost(ability, lowerCaseEffect);
  if (ABILITY_USES[ability.name]) {
    ability.uses = ABILITY_USES[ability.name];
  }
  addProgrammaticUses(ability);
  return ability;
};

const parseAbilityPage = async (
  url: string,
  markdown: NodeHtmlMarkdown
): Promise<[PathDetails, UncompleteEntityAbility[]]> => {
  const page = await fetch(url);
  if (!page.ok) {
    throwErrorResult(`${FETCH_ERROR_START}${page.statusText}`, page.status);
  }
  const pageData = await page.text();
  const $ = load(pageData);
  const pathName = cleanQuotes($("#firstHeading").first().text().trim());
  const pathDetails: PathDetails = { name: pathName, url, desc: "" };
  const abilities: UncompleteEntityAbility[] = [];
  const pageWrapper = $("#mw-content-text > div.mw-parser-output");

  let possibleAbilityName: string | undefined = undefined;
  let currentAbility: UncompleteEntityAbility | undefined = undefined;
  let foundFirstAbility = false;

  const completeCurrentAbility = () => {
    if (currentAbility) {
      abilities.push(addSpecialAbilityDetails(currentAbility, markdown));
      currentAbility = undefined;
    }
  };
  const initCurrentAbility = (name: string) => {
    if (!foundFirstAbility) {
      foundFirstAbility = true;
    }
    if (currentAbility) {
      completeCurrentAbility();
    }
    currentAbility = {
      name,
      effect: "",
      custom_fields: {
        path: pathName,
      },
      active: false,
    };
  };

  pageWrapper.children().each((_, el) => {
    const outerHTML = () => $.html(el);
    if (el.tagName === "p") {
      const fullEl = $(el);
      const text = fullEl.text().trim();
      if (text.length === 0) {
        possibleAbilityName = undefined;
        completeCurrentAbility();
        return;
      }
      const boldText = fullEl.children("b").first().text().trim();
      if (boldText === text) {
        // full line is bold - probably ability title
        possibleAbilityName = cleanQuotes(text);
      }
      if (
        possibleAbilityName &&
        abilitySecondLines.some((start) => text.startsWith(start))
      ) {
        initCurrentAbility(possibleAbilityName);
        possibleAbilityName = undefined;
      }
      if (currentAbility) {
        const handled = Object.entries(parseAbilityLine).some(
          ([start, fun]) => {
            if (
              text.toLowerCase().startsWith(start.toLowerCase()) &&
              currentAbility
            ) {
              fun(text, currentAbility);
              return true;
            }
            return false;
          }
        );
        if (!handled) {
          const italicText = fullEl.children("i").first().text().trim();
          if (
            italicText === text &&
            currentAbility.custom_fields &&
            !currentAbility.custom_fields.flavor &&
            !currentAbility.effect
          ) {
            // save first italic line as flavor text when it comes before any effects
            currentAbility.custom_fields.flavor = text;
          } else {
            currentAbility.effect += outerHTML();
          }
        }
      } else if (!foundFirstAbility && !possibleAbilityName) {
        const handled = Object.entries(parsePathLine).some(([start, fun]) => {
          if (text.startsWith(start)) {
            fun(text, pathDetails);
            return true;
          }
          return false;
        });
        if (!handled) {
          pathDetails.desc += outerHTML();
        }
      }
    } else if (addToDescTags.has(el.tagName)) {
      if (currentAbility) {
        currentAbility.effect += outerHTML();
      } else if (!foundFirstAbility) {
        pathDetails.desc += outerHTML();
      }
    }
  });
  if (currentAbility) {
    completeCurrentAbility();
  }
  pathDetails.desc = markdown.translate(pathDetails.desc);
  console.log(`Found ${abilities.length} abilities in ${pathName}`);
  return [pathDetails, abilities];
};

export const fetchAbilities = async (): Promise<PathsAndAbilities> => {
  console.log("starting to web scrape abilities");
  const markdown = new NodeHtmlMarkdown(
    { ignore: ["br", "img"] },
    // do not parse ability links
    { a: ({ node }) => ({ content: node.textContent ?? "" }) }
  );
  const paths: PathDetails[] = [];
  const abilities: UncompleteEntityAbility[] = [];
  const pageUrls = await fetchPathUrls();
  // iterate over urls consecutively instead of in parallel to prevent getting rate limited
  for await (const url of pageUrls) {
    let errCount = 0;
    while (errCount < 5) {
      try {
        const [path, pathAbilities] = await parseAbilityPage(url, markdown);
        paths.push(path);
        abilities.push(...pathAbilities);
        // sleep for 2 seconds to prevent getting rate limited by the wiki
        await sleep(2000);
        break;
      } catch (err: unknown) {
        if (err instanceof ResultError) {
          console.log(
            `Errored with ${err.name} with message ${err.message} while fetching ${url}. Sleeping and trying again`
          );
          // exponential back off
          await sleep(Math.pow(2, errCount) * 2000);
        } else {
          throw err;
        }
        errCount++;
      }
    }
  }
  console.log("complete web scrape abilities");
  return { paths, abilities };
};
