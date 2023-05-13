import axios from "axios";
import {
  AbilityCostMapBoolean,
  AbilityCostMapNumber,
  EntityAbilityFieldsStrings,
  PathDetails,
  PathsAndAbilities as PathsAndAbilities,
  UncompleteEntityAbility,
} from "../utils/types";
import { load } from "cheerio";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { cleanQuotes } from "./webscraperUtils";
import { ABILITY_USES, REPEATABLE_SIGNIFIERS } from "./abilitiesUses";

const LIST_OF_PATHS = "https://vennt.fandom.com/wiki/List_of_Paths";
const BASE_URL = "https://vennt.fandom.com";

const fetchPathUrls = async (): Promise<Set<string>> => {
  const pathUrls = new Set<string>();
  const page = await axios.get(LIST_OF_PATHS);
  const $ = load(page.data);
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

const parseTripple = (
  field: "mp_cost" | "cast_dl"
): ((text: string, ability: UncompleteEntityAbility) => void) => {
  return (text: string, ability: UncompleteEntityAbility): void => {
    const trippleRegex = /\[\s(-?\d+)\s\/\s(-?\d+)\s\/\s(-?\d+)\s\]/;
    const match = text.match(trippleRegex) || [];
    if (match.length >= 4 && ability.custom_fields) {
      const numbers = match.slice(1, 4).map((str) => parseInt(str));
      ability.custom_fields[field] = numbers;
    }
  };
};

const baseNumberRegex = "(?<number>-?\\d+(?:-\\d+)?\\*?)\\s";
const activationNumberRegex: Record<keyof AbilityCostMapNumber, RegExp> = {
  mp: new RegExp(`${baseNumberRegex}mp`),
  vim: new RegExp(`${baseNumberRegex}vim`),
  hp: new RegExp(`${baseNumberRegex}hp`),
  hero: new RegExp(`${baseNumberRegex}hero point`),
  actions: new RegExp(`${baseNumberRegex}action`),
  reactions: new RegExp(`${baseNumberRegex}reaction`),
};
const activationBooleanRegex: Record<keyof AbilityCostMapBoolean, RegExp> = {
  attack: /attack/,
  passive: /passive/,
  respite: /respite/,
  rest: /rest/,
  intermission: /intermission/,
};

const parseActivation = (
  text: string,
  ability: UncompleteEntityAbility
): void => {
  parseSimpleAbilityLine("activation")(text, ability);
  const cleanText = text.toLowerCase();
  Object.entries(activationNumberRegex).forEach(([keyIn, regex]) => {
    const key = keyIn as keyof AbilityCostMapNumber;
    const match = cleanText.match(regex);
    if (
      match &&
      match.length > 0 &&
      match.groups?.number &&
      ability.custom_fields
    ) {
      if (match.groups.number.match(/^-?\d+$/)) {
        const val = parseInt(match.groups.number);
        if (!isNaN(val)) {
          if (!ability.custom_fields.cost) {
            ability.custom_fields.cost = {};
          }
          ability.custom_fields.cost[key] = val;
        }
        // TODO: do something with match.groups.number if its not an integer
      }
    }
  });
  Object.entries(activationBooleanRegex).forEach(([keyIn, regex]) => {
    const key = keyIn as keyof AbilityCostMapBoolean;
    const match = cleanText.match(regex);
    if (match && match.length > 0 && ability.custom_fields) {
      if (!ability.custom_fields.cost) {
        ability.custom_fields.cost = {};
      }
      ability.custom_fields.cost[key] = true;
    }
  });
};

const parseAbilityLine: Record<
  string,
  (text: string, ability: UncompleteEntityAbility) => void
> = {
  "Cost:": parseSimpleAbilityLine("purchase"),
  "Expedited for:": parseSimpleAbilityLine("expedited"),
  "Unlocks:": parseSimpleAbilityLine("unlocks"),
  "Partially Unlocks:": parseSimpleAbilityLine("partial_unlocks"),
  "Build time:": parseSimpleAbilityLine("build_time"),
  "Range:": parseSimpleAbilityLine("range"),
  Prereq: parseSimpleAbilityLine("prereq"),
  "This ability is not required for the Path Completion Bonus": parseNotReq,
  "MP Cost:": parseTripple("mp_cost"),
  "Casting DL:": parseTripple("cast_dl"),
  "Activation:": parseActivation,
};

const abilitySecondLines = ["This ability", "Cost", "Prereq", "Unlock"];
const addToDescTags = new Set(["ul", "ol", "table"]);

const addSpecialAbilityDetails = (
  ability: UncompleteEntityAbility,
  markdown: NodeHtmlMarkdown
): UncompleteEntityAbility => {
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
  if (ABILITY_USES[ability.name]) {
    ability.uses = ABILITY_USES[ability.name];
  }
  ability.effect = markdown.translate(ability.effect);
  return ability;
};

const parseAbilityPage = async (
  url: string,
  markdown: NodeHtmlMarkdown
): Promise<[PathDetails, UncompleteEntityAbility[]]> => {
  const page = await axios.get(url);
  const $ = load(page.data);
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
    const [path, pathAbilities] = await parseAbilityPage(url, markdown);
    paths.push(path);
    abilities.push(...pathAbilities);
    // sleep for 2 seconds to prevent getting rate limited by the wiki
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("complete web scrape abilities");
  return { paths, abilities };
};
