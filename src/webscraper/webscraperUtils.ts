const attrMap = {
  Agility: "agi",
  Dexterity: "dex",
  Charisma: "cha",
  Intelligence: "int",
  Perception: "per",
  Spirit: "spi",
  Strength: "str",
  Technology: "tek",
  Wisdom: "wis",
};

export const parseAttr = (text: string): string => {
  for (const [old, rep] of Object.entries(attrMap)) {
    text = text.replace(old, rep); // rewrite attributes
  }
  return text;
};

export const parseBulk = (text: string): number => {
  let bulk = parseInt(text);
  if (isNaN(bulk)) {
    bulk = 0;
  }
  return bulk;
};

export const parseSP = (text: string): number | undefined => {
  const numVal = parseInt(text);
  if (text.includes("sp") && !isNaN(numVal)) {
    return numVal;
  }
  if (text.includes("cp")) {
    // basically 0
    return 0;
  }
  return undefined;
};

export const parseCourses = (text: string): string => {
  // '-' sometimes signifies no course required
  if (text === "-") {
    return "";
  }
  return text;
};
