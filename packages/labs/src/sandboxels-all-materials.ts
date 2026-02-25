/**
 * All Sandboxels Materials - Auto-generated from extraction
 * 
 * This file contains 367 materials
 * extracted from Sandboxels: 76 liquids, 227 solids, 64 gases
 */

import { type MaterialDefinition, BEHAVIOR_TYPES, MATERIAL_CATEGORIES } from './sandboxels-material-definitions';

export const ALL_SANDBOXELS_MATERIALS: Record<string, MaterialDefinition> = {
  water: {
    name: "Water",
    color: "#2167ff",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 997,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "steam",
    stateLow: "ice"
  },
  salt_water: {
    name: "Salt water",
    color: "#4d85ff",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1026,
    tempHigh: 102,
    tempLow: -2
  },
  sugar_water: {
    name: "Sugar water",
    color: "#8eaae6",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1026,
    tempHigh: 105,
    tempLow: -5
  },
  seltzer: {
    name: "Seltzer",
    color: "#888888",
    behavior: "WALL",
    category: "liquids",
    state: "liquid",
    density: 1026.91,
    tempHigh: 98,
    tempLow: 0
  },
  dirty_water: {
    name: "Dirty water",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1005,
    tempHigh: 105,
    tempLow: -5
  },
  pool_water: {
    name: "Pool water",
    color: "#a8d2e3",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 992.72,
    tempHigh: 105,
    tempLow: -5
  },
  algae: {
    name: "Algae",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "liquid",
    density: 920,
    tempHigh: 70,
    tempLow: 0,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  slush: {
    name: "Slush",
    color: "#81bcd4",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 95,
    tempHigh: 18,
    tempLow: -20,
    stateHigh: "water",
    stateLow: "ice"
  },
  magma: {
    name: "Magma",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.MOLTEN,
    category: "liquids",
    state: "liquid",
    density: 2725,
    tempLow: 800
  },
  slime: {
    name: "Slime",
    color: "#00ff88",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1450,
    tempHigh: 120,
    tempLow: 0,
    stateHigh: "steam"
  },
  antimolten: {
    name: "Antimolten",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "liquid",
    density: 1000,
    tempLow: 1750,
    stateLow: "antipowder"
  },
  antifluid: {
    name: "Antifluid",
    color: "#d1dbeb",
    behavior: "behaviors.AGLIQUID",
    category: "special",
    state: "liquid",
    density: 1000,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "antigas"
  },
  oil: {
    name: "Oil",
    color: "#470e00",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 825,
    tempHigh: 500,
    stateHigh: "fire"
  },
  lamp_oil: {
    name: "Lamp oil",
    color: "#b3b38b",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 850,
    tempHigh: 2100,
    tempLow: -30,
    stateHigh: "fire",
    stateLow: "wax"
  },
  acid: {
    name: "Acid",
    color: "#00ff00",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1049,
    tempHigh: 110,
    tempLow: -58.88,
    stateHigh: "acid_gas"
  },
  neutral_acid: {
    name: "Neutral acid",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1020,
    tempHigh: 110,
    stateHigh: "hydrogen"
  },
  glue: {
    name: "Glue",
    color: "#ffff00",
    behavior: "behaviors.STICKY",
    category: "liquids",
    state: "liquid",
    density: 1300,
    tempHigh: 475
  },
  soda: {
    name: "Soda",
    color: "#422016",
    behavior: "WALL",
    category: "liquids",
    state: "liquid",
    density: 1030,
    tempHigh: 100,
    tempLow: -1.11
  },
  strange_matter: {
    name: "Strange matter",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "liquid",
    density: 2000
  },
  melted_butter: {
    name: "Melted butter",
    color: "#ffe240",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "states",
    state: "liquid",
    density: 911,
    tempHigh: 1000,
    tempLow: 0,
    stateLow: "butter"
  },
  melted_cheese: {
    name: "Melted cheese",
    color: "#fcdb53",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "states",
    state: "liquid",
    density: 400,
    tempHigh: 1000,
    tempLow: 0,
    stateLow: "cheese"
  },
  cellulose: {
    name: "Cellulose",
    color: "#c7d4c9",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "life",
    state: "liquid",
    density: 1500,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "paper",
    stateLow: "paper"
  },
  melted_wax: {
    name: "Melted wax",
    color: "#d4c196",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 900,
    tempHigh: 1000,
    tempLow: 57,
    stateLow: "wax"
  },
  juice: {
    name: "Juice",
    color: "#f0bf3d",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1054,
    tempHigh: 160,
    tempLow: -10
  },
  broth: {
    name: "Broth",
    color: "#dbb169",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1052,
    tempHigh: 130,
    tempLow: 0
  },
  milk: {
    name: "Milk",
    color: "#fafafa",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1036.86,
    tempHigh: 100,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  chocolate_milk: {
    name: "Chocolate milk",
    color: "#664934",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1181,
    tempHigh: 100,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  fruit_milk: {
    name: "Fruit milk",
    color: "#c9988f",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1045,
    tempHigh: 100,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  pilk: {
    name: "Pilk",
    color: "#e9cba3",
    behavior: "WALL",
    category: "liquids",
    state: "liquid",
    density: 1033,
    tempHigh: 100,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  eggnog: {
    name: "Eggnog",
    color: "#ddbf98",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1033,
    tempHigh: 100,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  yolk: {
    name: "Yolk",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1027.5,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "hard_yolk",
    stateLow: "hard_yolk"
  },
  cream: {
    name: "Cream",
    color: "#f7f7f7",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 959.97,
    tempHigh: 200,
    tempLow: 0,
    stateLow: "ice_cream"
  },
  nut_milk: {
    name: "Nut milk",
    color: "#D7D1C3",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1107.41,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "steam",
    stateLow: "ice"
  },
  batter: {
    name: "Batter",
    color: "#d4bc85",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1001,
    tempHigh: 94,
    stateHigh: "baked_batter"
  },
  vinegar: {
    name: "Vinegar",
    color: "#ffecb3",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1006,
    tempHigh: 100.6,
    tempLow: -2.22
  },
  sauce: {
    name: "Sauce",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1031.33,
    tempHigh: 260,
    tempLow: -2
  },
  nut_oil: {
    name: "Nut oil",
    color: "#E7D784",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 910,
    tempHigh: 250
  },
  nut_butter: {
    name: "Nut butter",
    color: "#cd9141",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1090.5,
    tempHigh: 232
  },
  jelly: {
    name: "Jelly",
    color: "#A35298",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 1245,
    tempHigh: 200,
    tempLow: -5
  },
  yogurt: {
    name: "Yogurt",
    color: "#f0efe6",
    behavior: "WALL",
    category: "food",
    state: "liquid",
    density: 820.33,
    tempHigh: 1000,
    tempLow: 0
  },
  beans: {
    name: "Beans",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "food",
    state: "liquid",
    density: 721,
    tempHigh: 350
  },
  alcohol: {
    name: "Alcohol",
    color: "#c9c5b1",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 785.1,
    tempHigh: 78.37,
    tempLow: -113.88
  },
  molten_tuff: {
    name: "Molten tuff",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.MOLTEN,
    category: "states",
    state: "liquid",
    density: 2725,
    tempLow: 1000,
    stateLow: "tuff"
  },
  soap: {
    name: "Soap",
    color: "#f2f2f2",
    behavior: "WALL",
    category: "liquids",
    state: "liquid",
    density: 1055,
    tempHigh: 100,
    stateHigh: "bubble"
  },
  bleach: {
    name: "Bleach",
    color: "#ffffff",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1210,
    tempHigh: 111,
    tempLow: -15.3
  },
  liquid_chlorine: {
    name: "Liquid chlorine",
    color: "#f4d217",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "states",
    state: "liquid",
    density: 1562.5,
    tempLow: -101.5,
    stateHigh: "chlorine"
  },
  dye: {
    name: "Dye",
    color: "#ff00ff",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 998,
    tempHigh: 100,
    stateHigh: "smoke"
  },
  ink: {
    name: "Ink",
    color: "#171717",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1074.3,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "smoke"
  },
  mercury: {
    name: "Mercury",
    color: "#c0c0c0",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 13545,
    tempHigh: 356.73,
    tempLow: -38.83
  },
  blood: {
    name: "Blood",
    color: "#8b0000",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1060,
    tempHigh: 124.55,
    tempLow: 0
  },
  vaccine: {
    name: "Vaccine",
    color: "#e0d0ad",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1125,
    tempHigh: 130,
    tempLow: -2.5,
    stateHigh: "steam"
  },
  antibody: {
    name: "Antibody",
    color: "#ff4040",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1060,
    tempHigh: 120,
    tempLow: 0
  },
  infection: {
    name: "Infection",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1060,
    tempHigh: 124.55,
    tempLow: 0
  },
  poison: {
    name: "Poison",
    color: "#00ff00",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1060,
    tempHigh: 110,
    tempLow: 0
  },
  antidote: {
    name: "Antidote",
    color: "#c9b836",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1060,
    tempHigh: 124.55,
    tempLow: -2.5
  },
  tea: {
    name: "Tea",
    color: "#6c4317",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1001,
    tempHigh: 125,
    tempLow: 0
  },
  coffee: {
    name: "Coffee",
    color: "#24100b",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1001.74,
    tempHigh: 130,
    tempLow: 0
  },
  honey: {
    name: "Honey",
    color: "#d4a017",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1420,
    tempHigh: 71.11,
    tempLow: 0,
    stateHigh: "caramel",
    stateLow: "candy"
  },
  sap: {
    name: "Sap",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1400,
    tempHigh: 103.05,
    tempLow: 0
  },
  caramel: {
    name: "Caramel",
    color: "#e89a51",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 850,
    tempHigh: 400,
    tempLow: -20,
    stateHigh: "smoke",
    stateLow: "candy"
  },
  molasses: {
    name: "Molasses",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1600,
    tempHigh: 1000,
    tempLow: 0,
    stateLow: "candy"
  },
  ketchup: {
    name: "Ketchup",
    color: "#ff3119",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1235,
    tempHigh: 260
  },
  mayo: {
    name: "Mayo",
    color: "#fcffbd",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 910,
    tempHigh: 100.6
  },
  grease: {
    name: "Grease",
    color: "#cf9251",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 919,
    tempHigh: 250,
    tempLow: 20
  },
  melted_chocolate: {
    name: "Melted chocolate",
    color: "#3b160b",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "states",
    state: "liquid",
    density: 1325,
    tempHigh: 99,
    tempLow: 0,
    stateLow: "chocolate"
  },
  liquid_hydrogen: {
    name: "Liquid hydrogen",
    color: "#97afcf",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 71,
    tempLow: -259.2,
    stateHigh: "hydrogen"
  },
  liquid_oxygen: {
    name: "Liquid oxygen",
    color: "#00ad99",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 1141,
    tempLow: -218.8,
    stateHigh: "oxygen"
  },
  liquid_nitrogen: {
    name: "Liquid nitrogen",
    color: "#d3e1e3",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 804,
    tempLow: -259.86,
    stateHigh: "nitrogen",
    stateLow: "nitrogen_ice"
  },
  liquid_helium: {
    name: "Liquid helium",
    color: "#e3d3d3",
    behavior: "behaviors.SUPERFLUID",
    category: "states",
    state: "liquid",
    density: 145,
    stateHigh: "helium"
  },
  liquid_neon: {
    name: "Liquid neon",
    color: "#d1d1d1",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "states",
    state: "liquid",
    density: 1207,
    tempLow: -248.6,
    stateHigh: "neon"
  },
  cyanide: {
    name: "Cyanide",
    color: "#b6ccb6",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "liquid",
    density: 687,
    tempHigh: 26,
    tempLow: -13.29
  },
  midas_touch: {
    name: "Midas touch",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "special",
    state: "liquid",
    density: 193
  },
  nitro: {
    name: "Nitro",
    color: "#47c900",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "weapons",
    state: "liquid",
    density: 1600,
    tempHigh: 600,
    tempLow: 14,
    stateHigh: "fire"
  },
  greek_fire: {
    name: "Greek fire",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "weapons",
    state: "liquid",
    density: 498.5,
    tempHigh: 4000,
    stateHigh: "fire"
  },
  tsunami: {
    name: "Tsunami",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "liquid",
    density: 997
  },
  primordial_soup: {
    name: "Primordial soup",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "liquid",
    density: 955,
    tempHigh: 100,
    tempLow: -10,
    stateHigh: "steam"
  },
  sand: {
    name: "Sand",
    color: "#e6d577",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 1602,
    tempHigh: 1700,
    stateHigh: "molten_glass"
  },
  dirt: {
    name: "Dirt",
    color: ["#76552b", "#5c4221", "#573c1a", "#6b481e"], // Brown variations
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 1220,
    tempHigh: 1200,
    tempLow: -50,
    stateLow: "permafrost"
  },
  mud: {
    name: "Mud",
    color: "#382417",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "land",
    state: "solid",
    density: 1730,
    tempHigh: 100,
    tempLow: -50,
    stateHigh: "mudstone",
    stateLow: "permafrost"
  },
  wet_sand: {
    name: "Wet sand",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "land",
    state: "solid",
    density: 1905,
    tempHigh: 100,
    tempLow: -50,
    stateHigh: "packed_sand",
    stateLow: "packed_sand"
  },
  rock: {
    name: "Rock",
    color: ["#888888", "#7a7a7a", "#969696"], // Grey variations
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 2550,
    tempHigh: 950,
    stateHigh: "magma"
  },
  rock_wall: {
    name: "Rock wall",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "land",
    state: "solid",
    density: 2550,
    tempHigh: 950,
    stateHigh: "magma"
  },
  mudstone: {
    name: "Mudstone",
    color: "#4a341e",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "land",
    state: "solid",
    density: 1250,
    tempHigh: 1200,
    tempLow: -50,
    stateHigh: "molten_dirt",
    stateLow: "permafrost"
  },
  packed_sand: {
    name: "Packed sand",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "land",
    state: "solid",
    density: 1682,
    tempHigh: 1700,
    stateHigh: "molten_glass"
  },
  plant: {
    name: "Plant",
    color: "#00bf00",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 100,
    tempLow: -1.66,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  dead_plant: {
    name: "Dead plant",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 300,
    tempLow: -2,
    stateHigh: "fire",
    stateLow: "frozen_plant"
  },
  frozen_plant: {
    name: "Frozen plant",
    color: "#00bf8c",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 7,
    stateHigh: "dead_plant"
  },
  grass: {
    name: "Grass",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1400,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  concrete: {
    name: "Concrete",
    color: "#ababab",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 2400,
    tempHigh: 1500,
    stateHigh: "magma"
  },
  bomb: {
    name: "Bomb",
    color: "#524c41",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300
  },
  ice: {
    name: "Ice",
    color: "#b2daeb",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 917,
    tempHigh: 5,
    stateHigh: "water"
  },
  rime: {
    name: "Rime",
    color: "#e6f2f7",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 250,
    tempHigh: 20,
    stateHigh: "water"
  },
  snow: {
    name: "Snow",
    color: "#e1f8fc",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 100,
    tempHigh: 18,
    tempLow: -100,
    stateHigh: "water",
    stateLow: "packed_snow"
  },
  packed_snow: {
    name: "Packed snow",
    color: "#bcdde3",
    behavior: BEHAVIOR_TYPES.SUPPORTPOWDER,
    category: "land",
    state: "solid",
    density: 400,
    tempHigh: 20,
    tempLow: -200,
    stateHigh: "water",
    stateLow: "ice"
  },
  wood: {
    name: "Wood",
    color: "#a0522d",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    tempHigh: 400
  },
  glass: {
    name: "Glass",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 2500,
    tempHigh: 1500
  },
  rad_glass: {
    name: "Rad glass",
    color: "#888888",
    behavior: "WALL",
    category: "solids",
    state: "solid",
    density: 2500,
    tempHigh: 1500
  },
  meat: {
    name: "Meat",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1019.5,
    tempHigh: 100,
    tempLow: -18,
    stateHigh: "cooked_meat",
    stateLow: "frozen_meat"
  },
  rotten_meat: {
    name: "Rotten meat",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1005,
    tempHigh: 300
  },
  cured_meat: {
    name: "Cured meat",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1019.5,
    tempHigh: 100,
    stateHigh: "cooked_meat"
  },
  cooked_meat: {
    name: "Cooked meat",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 1005,
    tempHigh: 300,
    stateHigh: "ash"
  },
  frozen_meat: {
    name: "Frozen meat",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 1067.5,
    tempHigh: 0,
    stateHigh: "meat"
  },
  salt: {
    name: "Salt",
    color: "#ffffff",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 2160,
    tempHigh: 801
  },
  sugar: {
    name: "Sugar",
    color: "#f2f2f2",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1590,
    tempHigh: 186,
    stateHigh: "caramel"
  },
  flour: {
    name: "Flour",
    color: "#fffef0",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 600,
    tempHigh: 400,
    stateHigh: "fire"
  },
  smash: {
    name: "Smash",
    color: "#ae4cd9",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "tools",
    state: "solid",
    density: 1834,
    tempHigh: 950,
    tempLow: 0,
    stateHigh: "magma",
    stateLow: "concrete"
  },
  gravel: {
    name: "Gravel",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 1680,
    tempHigh: 950,
    stateHigh: "magma"
  },
  cement: {
    name: "Cement",
    color: "#b5b5b5",
    behavior: BEHAVIOR_TYPES.LIQUID,
    category: "liquids",
    state: "solid",
    density: 1440,
    tempHigh: 1550,
    tempLow: -10,
    stateHigh: "magma",
    stateLow: "concrete"
  },
  dust: {
    name: "Dust",
    color: "#666666",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 1490,
    tempHigh: 425,
    stateHigh: "fire"
  },
  cell: {
    name: "Cell",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1000.1,
    tempHigh: 102,
    tempLow: -2
  },
  cancer: {
    name: "Cancer",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1000.2,
    tempHigh: 80,
    tempLow: -30,
    stateHigh: "plague",
    stateLow: "dirty_water"
  },
  dna: {
    name: "Dna",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "life",
    state: "solid",
    density: 1700,
    tempHigh: 190,
    stateHigh: "smoke"
  },
  worm: {
    name: "Worm",
    color: "#d34c37",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "frozen_worm"
  },
  frozen_worm: {
    name: "Frozen worm",
    color: "#37d3b6",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 5,
    stateHigh: "worm"
  },
  flea: {
    name: "Flea",
    color: "#9e4732",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 400,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  termite: {
    name: "Termite",
    color: "#f5a056",
    behavior: "WALL",
    category: "life",
    state: "solid",
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  ant: {
    name: "Ant",
    color: "#5e0b04",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 500,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  spider: {
    name: "Spider",
    color: "#4f2d2d",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 500,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  web: {
    name: "Web",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "life",
    state: "solid",
    tempHigh: 220,
    stateHigh: "smoke"
  },
  fly: {
    name: "Fly",
    color: "#4c4e42",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  firefly: {
    name: "Firefly",
    color: "#684841",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  bee: {
    name: "Bee",
    color: "#c4b100",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "ash",
    stateLow: "dead_bug"
  },
  hive: {
    name: "Hive",
    color: "#a6a479",
    behavior: "WALL",
    category: "life",
    state: "solid",
    tempHigh: 300
  },
  stink_bug: {
    name: "Stink bug",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "stench",
    stateLow: "dead_bug"
  },
  dead_bug: {
    name: "Dead bug",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 100,
    stateHigh: "ash"
  },
  body: {
    name: "Body",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 150,
    tempLow: -30,
    stateHigh: "cooked_meat",
    stateLow: "frozen_meat"
  },
  head: {
    name: "Head",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1080,
    tempHigh: 150,
    tempLow: -30,
    stateHigh: "cooked_meat",
    stateLow: "frozen_meat"
  },
  bird: {
    name: "Bird",
    color: "#997457",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 400,
    tempHigh: 120,
    tempLow: -18,
    stateHigh: "cooked_meat",
    stateLow: "frozen_meat"
  },
  rat: {
    name: "Rat",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1450,
    tempHigh: 120,
    tempLow: -18,
    stateHigh: "rotten_meat",
    stateLow: "frozen_meat"
  },
  frog: {
    name: "Frog",
    color: "#607300",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1450,
    tempHigh: 100,
    tempLow: -18,
    stateHigh: "cooked_meat",
    stateLow: "frozen_frog"
  },
  frozen_frog: {
    name: "Frozen frog",
    color: "#007349",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 5,
    stateHigh: "frog"
  },
  tadpole: {
    name: "Tadpole",
    color: "#87b574",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1450,
    tempHigh: 100,
    tempLow: -10,
    stateHigh: "steam",
    stateLow: "ice"
  },
  fish: {
    name: "Fish",
    color: "#ac8650",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1080,
    tempHigh: 120,
    tempLow: -20,
    stateHigh: "cooked_meat"
  },
  frozen_fish: {
    name: "Frozen fish",
    color: "#50ac86",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 5,
    stateHigh: "fish"
  },
  slug: {
    name: "Slug",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1450,
    tempHigh: 90,
    tempLow: 5,
    stateHigh: "slime",
    stateLow: "slime"
  },
  snail: {
    name: "Snail",
    color: "#5c3104",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 100,
    tempLow: -6.4,
    stateHigh: "limestone",
    stateLow: "limestone"
  },
  fuse: {
    name: "Fuse",
    color: "#825d38",
    behavior: "WALL",
    category: "machines",
    state: "solid",
    density: 1000,
    tempHigh: 500,
    stateHigh: "fire"
  },
  bone: {
    name: "Bone",
    color: "#d9d9d9",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "life",
    state: "solid",
    density: 1900,
    tempHigh: 760,
    stateHigh: "quicklime"
  },
  ball: {
    name: "Ball",
    color: "#e35693",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 1052,
    tempHigh: 250,
    stateHigh: "molten_plastic"
  },
  balloon: {
    name: "Balloon",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 0.164,
    tempHigh: 120,
    tempLow: -272.2,
    stateHigh: "pop",
    stateLow: "pop"
  },
  antipowder: {
    name: "Antipowder",
    color: "#ebd1d8",
    behavior: "behaviors.AGPOWDER",
    category: "special",
    state: "solid",
    density: 1850,
    tempHigh: 1850,
    stateHigh: "antimolten"
  },
  ash: {
    name: "Ash",
    color: "#4a4a4a",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 700,
    tempHigh: 2000
  },
  charcoal: {
    name: "Charcoal",
    color: "#1a1a1a",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 208,
    tempHigh: 6000,
    stateHigh: "fire"
  },
  tinder: {
    name: "Tinder",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "powders",
    state: "solid",
    density: 23,
    tempHigh: 400,
    stateHigh: "fire"
  },
  sawdust: {
    name: "Sawdust",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 393,
    tempHigh: 400,
    stateHigh: "fire"
  },
  hail: {
    name: "Hail",
    color: "#c5e9f0",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 850,
    tempHigh: 10,
    stateHigh: "water"
  },
  stained_glass: {
    name: "Stained glass",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 2500,
    tempHigh: 1500
  },
  clay: {
    name: "Clay",
    color: "#d4c59c",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "land",
    state: "solid",
    density: 1760,
    tempHigh: 135,
    tempLow: -50,
    stateHigh: "baked_clay",
    stateLow: "clay_soil"
  },
  clay_soil: {
    name: "Clay soil",
    color: "#888888",
    behavior: "WALL",
    category: "land",
    state: "solid",
    density: 1600,
    tempHigh: 140,
    stateHigh: "brick"
  },
  brick: {
    name: "Brick",
    color: "#cb4141",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 1650,
    tempHigh: 1540
  },
  ruins: {
    name: "Ruins",
    color: "#5c5c5c",
    behavior: "WALL",
    category: "solids",
    state: "solid",
    density: 2400,
    tempHigh: 1500,
    stateHigh: "magma"
  },
  adobe: {
    name: "Adobe",
    color: "#8a6249",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    tempHigh: 1200,
    stateHigh: "molten_dirt"
  },
  sapling: {
    name: "Sapling",
    color: "#3e9c3e",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  pinecone: {
    name: "Pinecone",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 500,
    stateHigh: "wood"
  },
  evergreen: {
    name: "Evergreen",
    color: "#006300",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 100,
    stateHigh: "dead_plant"
  },
  cactus: {
    name: "Cactus",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 600,
    tempHigh: 250,
    tempLow: -5,
    stateLow: "frozen_plant"
  },
  kelp: {
    name: "Kelp",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 80,
    tempLow: 0,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  coral: {
    name: "Coral",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 825,
    tempLow: 0,
    stateHigh: "quicklime",
    stateLow: "limestone"
  },
  grass_seed: {
    name: "Grass seed",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1400,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  wheat_seed: {
    name: "Wheat seed",
    color: "#b6c981",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 769,
    tempHigh: 400,
    tempLow: -2,
    stateHigh: "fire",
    stateLow: "frozen_plant"
  },
  straw: {
    name: "Straw",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 67.5,
    tempHigh: 400,
    stateHigh: "fire"
  },
  porcelain: {
    name: "Porcelain",
    color: "#e1e4dd",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 2403
  },
  paper: {
    name: "Paper",
    color: "#f0f0f0",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 1201,
    tempHigh: 248
  },
  pollen: {
    name: "Pollen",
    color: "#ffd700",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1435,
    tempHigh: 400,
    stateHigh: "ash"
  },
  flower_seed: {
    name: "Flower seed",
    color: "#0e990e",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1400,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  pistil: {
    name: "Pistil",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1400,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  petal: {
    name: "Petal",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1400,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  tree_branch: {
    name: "Tree branch",
    color: "#a0522d",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1500,
    tempHigh: 100,
    tempLow: -30,
    stateHigh: "wood",
    stateLow: "wood"
  },
  vine: {
    name: "Vine",
    color: "#005900",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1050,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "frozen_plant"
  },
  bamboo_plant: {
    name: "Bamboo plant",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 686,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "dead_plant",
    stateLow: "bamboo"
  },
  gray_goo: {
    name: "Gray goo",
    color: "#c0c0c0",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 21450,
    tempHigh: 1456,
    stateHigh: "molten_steel"
  },
  malware: {
    name: "Malware",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 2.1
  },
  clone_powder: {
    name: "Clone powder",
    color: "#f0f000",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "machines",
    state: "solid",
    density: 2710
  },
  floating_cloner: {
    name: "Floating cloner",
    color: "#c7c787",
    behavior: "WALL",
    category: "machines",
    state: "solid",
    density: 1355
  },
  virus: {
    name: "Virus",
    color: "#cc00ff",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 600
  },
  ice_nine: {
    name: "Ice nine",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "solid",
    density: 917
  },
  permafrost: {
    name: "Permafrost",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "land",
    state: "solid",
    density: 700,
    tempHigh: 10,
    stateHigh: "mudstone"
  },
  mushroom_spore: {
    name: "Mushroom spore",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 123.6,
    tempHigh: 225,
    stateHigh: "fire"
  },
  mushroom_stalk: {
    name: "Mushroom stalk",
    color: "#d1d1d1",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 90.445,
    tempHigh: 225,
    stateHigh: "fire"
  },
  mushroom_gill: {
    name: "Mushroom gill",
    color: "#d4cfa9",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 90.445,
    tempHigh: 225,
    stateHigh: "fire"
  },
  mushroom_cap: {
    name: "Mushroom cap",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "life",
    state: "solid",
    density: 90.445,
    tempHigh: 225,
    stateHigh: "fire"
  },
  hyphae: {
    name: "Hyphae",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 462,
    tempHigh: 225,
    stateHigh: "fire"
  },
  mycelium: {
    name: "Mycelium",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 462,
    tempHigh: 225,
    tempLow: -50,
    stateHigh: "dirt",
    stateLow: "permafrost"
  },
  mulch: {
    name: "Mulch",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 380,
    tempHigh: 400
  },
  ant_wall: {
    name: "Ant wall",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "land",
    state: "solid",
    density: 1220,
    tempHigh: 1400,
    tempLow: -50,
    stateLow: "permafrost"
  },
  lichen: {
    name: "Lichen",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1.5,
    tempHigh: 400,
    stateHigh: "fire"
  },
  plastic: {
    name: "Plastic",
    color: "#c5dede",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 1052,
    tempHigh: 250
  },
  cloth: {
    name: "Cloth",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    tempHigh: 412,
    stateHigh: "fire"
  },
  wax: {
    name: "Wax",
    color: "#fff3d6",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "powders",
    state: "solid",
    density: 900,
    tempHigh: 57,
    stateHigh: "melted_wax"
  },
  incense: {
    name: "Incense",
    color: "#361f19",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "powders",
    state: "solid",
    density: 686,
    tempHigh: 2320
  },
  insulation: {
    name: "Insulation",
    color: "#b8aea5",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid"
  },
  sponge: {
    name: "Sponge",
    color: "#888888",
    behavior: "WALL",
    category: "solids",
    state: "solid",
    density: 65,
    tempHigh: 500,
    stateHigh: "fire"
  },
  bamboo: {
    name: "Bamboo",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 686,
    tempHigh: 380
  },
  pyrite: {
    name: "Pyrite",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 4900,
    tempHigh: 1182.5
  },
  egg: {
    name: "Egg",
    color: "#e0d3ab",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1031,
    tempHigh: 1500
  },
  hard_yolk: {
    name: "Hard yolk",
    color: "#dead43",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 1031,
    tempHigh: 400,
    stateHigh: "smoke"
  },
  dough: {
    name: "Dough",
    color: "#bfac91",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 526.9,
    tempHigh: 94,
    stateHigh: "bread"
  },
  homunculus: {
    name: "Homunculus",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1450,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "meat",
    stateLow: "frozen_meat"
  },
  butter: {
    name: "Butter",
    color: "#ffe46b",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 860,
    tempHigh: 33,
    stateHigh: "melted_butter"
  },
  cheese: {
    name: "Cheese",
    color: "#fcba03",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 477.62,
    tempHigh: 54,
    stateHigh: "melted_cheese"
  },
  rotten_cheese: {
    name: "Rotten cheese",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 470,
    tempHigh: 54
  },
  cheese_powder: {
    name: "Cheese powder",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 470,
    tempHigh: 54,
    stateHigh: "melted_cheese"
  },
  chocolate: {
    name: "Chocolate",
    color: "#4d2818",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 1325,
    tempHigh: 31,
    stateHigh: "melted_chocolate"
  },
  chocolate_powder: {
    name: "Chocolate powder",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1325,
    tempHigh: 31,
    stateHigh: "melted_chocolate"
  },
  grape: {
    name: "Grape",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1154,
    tempHigh: 256
  },
  herb: {
    name: "Herb",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1400,
    tempHigh: 300,
    tempLow: -2,
    stateLow: "frozen_plant"
  },
  lettuce: {
    name: "Lettuce",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1400,
    tempHigh: 300
  },
  pickle: {
    name: "Pickle",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 625,
    tempHigh: 300
  },
  tomato: {
    name: "Tomato",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1014.42,
    tempHigh: 300
  },
  pumpkin: {
    name: "Pumpkin",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 490.3,
    tempHigh: 800,
    stateHigh: "ash"
  },
  pumpkin_seed: {
    name: "Pumpkin seed",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 950.33,
    tempHigh: 400,
    tempLow: -2,
    stateHigh: "fire",
    stateLow: "frozen_plant"
  },
  corn: {
    name: "Corn",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 721,
    tempHigh: 180,
    stateHigh: "popcorn"
  },
  popcorn: {
    name: "Popcorn",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 360.5,
    tempHigh: 500,
    stateHigh: "ash"
  },
  corn_seed: {
    name: "Corn seed",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 721,
    tempHigh: 400,
    tempLow: -2,
    stateHigh: "fire",
    stateLow: "frozen_plant"
  },
  potato: {
    name: "Potato",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 675,
    tempHigh: 176,
    stateHigh: "baked_potato"
  },
  baked_potato: {
    name: "Baked potato",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 675,
    tempHigh: 400,
    stateHigh: "ash"
  },
  mashed_potato: {
    name: "Mashed potato",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 675,
    tempHigh: 400
  },
  potato_seed: {
    name: "Potato seed",
    color: "#888888",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 675,
    tempHigh: 400,
    tempLow: -2,
    stateHigh: "fire",
    stateLow: "frozen_plant"
  },
  root: {
    name: "Root",
    color: "#80715b",
    behavior: "WALL",
    category: "life",
    state: "solid",
    density: 1250,
    tempHigh: 275,
    tempLow: -50,
    stateHigh: "dirt",
    stateLow: "fiber"
  },
  fiber: {
    name: "Fiber",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "life",
    state: "solid",
    density: 462,
    tempHigh: 275,
    tempLow: -50,
    stateHigh: "dirt",
    stateLow: "permafrost"
  },
  yeast: {
    name: "Yeast",
    color: "#888888",
    behavior: "WALL",
    category: "food",
    state: "solid",
    density: 1180,
    tempHigh: 110,
    stateHigh: "bread"
  },
  bread: {
    name: "Bread",
    color: "#debd8c",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 233.96,
    tempHigh: 176,
    stateHigh: "toast"
  },
  toast: {
    name: "Toast",
    color: "#c08655",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 233.96,
    tempHigh: 550,
    stateHigh: "ash"
  },
  gingerbread: {
    name: "Gingerbread",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "food",
    state: "solid",
    density: 233.96,
    tempHigh: 875,
    stateHigh: "ash"
  },
  crumb: {
    name: "Crumb",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 233.96,
    tempHigh: 550,
    stateHigh: "ash"
  },
  baked_batter: {
    name: "Baked batter",
    color: "#fcdf7e",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 233.96,
    tempHigh: 550,
    stateHigh: "ash"
  },
  wheat: {
    name: "Wheat",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "food",
    state: "solid",
    density: 769,
    tempHigh: 100,
    tempLow: -2,
    stateHigh: "straw",
    stateLow: "straw"
  },
  rice: {
    name: "Rice",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1182,
    tempHigh: 500,
    stateHigh: "fire"
  },
  candy: {
    name: "Candy",
    color: "#e6cab1",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "food",
    state: "solid",
    density: 900,
    tempHigh: 186,
    stateHigh: "caramel"
  },
  coffee_bean: {
    name: "Coffee bean",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 650,
    tempHigh: 400,
    stateHigh: "fire"
  },
  coffee_ground: {
    name: "Coffee ground",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 1002,
    tempHigh: 400,
    stateHigh: "fire"
  },
  nut: {
    name: "Nut",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 325,
    tempHigh: 400,
    stateHigh: "fire"
  },
  nut_meat: {
    name: "Nut meat",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 905,
    tempHigh: 150
  },
  baking_soda: {
    name: "Baking soda",
    color: "#ededed",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "food",
    state: "solid",
    density: 2200,
    tempHigh: 200
  },
  ice_cream: {
    name: "Ice cream",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "food",
    state: "solid",
    density: 1096,
    tempHigh: 15,
    stateHigh: "cream"
  },
  dry_ice: {
    name: "Dry ice",
    color: "#e6e6e6",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 1562,
    stateHigh: "carbon_dioxide"
  },
  nitrogen_ice: {
    name: "Nitrogen ice",
    color: "#e6e6e6",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 1562,
    stateHigh: "liquid_nitrogen"
  },
  particleboard: {
    name: "Particleboard",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    tempHigh: 500
  },
  skin: {
    name: "Skin",
    color: "#888888",
    behavior: "WALL",
    category: "solids",
    state: "solid",
    density: 1019.5,
    tempHigh: 200,
    tempLow: -18,
    stateLow: "frozen_meat"
  },
  hair: {
    name: "Hair",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "solids",
    state: "solid",
    density: 2395,
    tempHigh: 223
  },
  basalt: {
    name: "Basalt",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "land",
    state: "solid",
    density: 3000,
    tempHigh: 1262.5,
    stateHigh: "magma"
  },
  tuff: {
    name: "Tuff",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORTPOWDER,
    category: "land",
    state: "solid",
    density: 2605,
    tempHigh: 1080,
    stateHigh: "magma"
  },
  sodium: {
    name: "Sodium",
    color: "#888888",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 968,
    tempHigh: 97.794
  },
  calcium: {
    name: "Calcium",
    color: "#888888",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 1550,
    tempHigh: 842
  },
  limestone: {
    name: "Limestone",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "land",
    state: "solid",
    density: 2100,
    tempHigh: 825
  },
  quicklime: {
    name: "Quicklime",
    color: "#e9ebe7",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "land",
    state: "solid",
    density: 1025,
    tempHigh: 2613,
    stateHigh: "molten_calcium"
  },
  slaked_lime: {
    name: "Slaked lime",
    color: "#A8A19D",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "land",
    state: "solid",
    density: 2211,
    tempHigh: 580,
    stateHigh: "quicklime"
  },
  potassium: {
    name: "Potassium",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 890,
    tempHigh: 63.5
  },
  magnesium: {
    name: "Magnesium",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 890,
    tempHigh: 63.5
  },
  lye: {
    name: "Lye",
    color: "#c5d3eb",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2130,
    tempHigh: 323
  },
  thermite: {
    name: "Thermite",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 700,
    tempHigh: 660
  },
  slag: {
    name: "Slag",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2400,
    tempHigh: 1380
  },
  amalgam: {
    name: "Amalgam",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 13920,
    tempHigh: 223
  },
  sulfur: {
    name: "Sulfur",
    color: "#ffd700",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2070,
    tempHigh: 115.21
  },
  copper_sulfate: {
    name: "Copper sulfate",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 3600,
    tempHigh: 110
  },
  fallout: {
    name: "Fallout",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "solid",
    density: 1490
  },
  uranium: {
    name: "Uranium",
    color: ["#599e61","#364d3c","#494d4a","#6c8a42","#798d65","#b5e089"],
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 19100,
    tempHigh: 1132.2
  },
  diamond: {
    name: "Diamond",
    color: "#b9f2ff",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 3515
  },
  gold_coin: {
    name: "Gold coin",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 19300,
    tempHigh: 1064,
    stateHigh: "molten_gold"
  },
  rust: {
    name: "Rust",
    color: "#b7410e",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 5250,
    tempHigh: 1538,
    stateHigh: "molten_iron"
  },
  oxidized_copper: {
    name: "Oxidized copper",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 8960,
    tempHigh: 1085,
    stateHigh: "molten_copper"
  },
  alga: {
    name: "Alga",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 3905,
    tempHigh: 345.03
  },
  metal_scrap: {
    name: "Metal scrap",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2720,
    tempHigh: 1538
  },
  glass_shard: {
    name: "Glass shard",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2500,
    tempHigh: 1500,
    stateHigh: "molten_glass"
  },
  rad_shard: {
    name: "Rad shard",
    color: "#888888",
    behavior: "behaviors.RADPOWDER",
    category: "powders",
    state: "solid",
    density: 2500,
    tempHigh: 1500,
    stateHigh: "molten_rad_glass"
  },
  brick_rubble: {
    name: "Brick rubble",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 1650,
    tempHigh: 1540,
    stateHigh: "molten_brick"
  },
  baked_clay: {
    name: "Baked clay",
    color: "#b85746",
    behavior: BEHAVIOR_TYPES.SUPPORT,
    category: "powders",
    state: "solid",
    density: 2000,
    tempHigh: 1300,
    stateHigh: "porcelain"
  },
  clay_shard: {
    name: "Clay shard",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2000,
    tempHigh: 1300,
    stateHigh: "porcelain_shard"
  },
  porcelain_shard: {
    name: "Porcelain shard",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2000
  },
  feather: {
    name: "Feather",
    color: "#888888",
    behavior: "behaviors.LIGHTWEIGHT",
    category: "powders",
    state: "solid",
    density: 500,
    tempHigh: 400
  },
  confetti: {
    name: "Confetti",
    color: "#888888",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 1201,
    tempHigh: 248
  },
  glitter: {
    name: "Glitter",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 1450,
    tempHigh: 100
  },
  bead: {
    name: "Bead",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 1052,
    tempHigh: 185,
    stateHigh: "molten_plastic"
  },
  color_sand: {
    name: "Color sand",
    color: "#888888",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 1602,
    tempHigh: 1700,
    stateHigh: "molten_stained_glass"
  },
  caustic_potash: {
    name: "Caustic potash",
    color: "#feffe8",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2044,
    tempHigh: 410
  },
  sodium_acetate: {
    name: "Sodium acetate",
    color: "#888888",
    behavior: "WALL",
    category: "powders",
    state: "solid",
    density: 1530,
    tempHigh: 881.4
  },
  borax: {
    name: "Borax",
    color: "#ffffff",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 2370,
    tempHigh: 743
  },
  epsom_salt: {
    name: "Epsom salt",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 1680,
    tempHigh: 1124
  },
  potassium_salt: {
    name: "Potassium salt",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "powders",
    state: "solid",
    density: 3980,
    tempHigh: 292
  },
  tnt: {
    name: "Tnt",
    color: "#c92a2a",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "weapons",
    state: "solid",
    density: 1630,
    tempHigh: 600,
    stateHigh: "explosion"
  },
  c4: {
    name: "C4",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.STURDYPOWDER,
    category: "weapons",
    state: "solid",
    density: 1630
  },
  grenade: {
    name: "Grenade",
    color: "#5e5c57",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 1455.5,
    stateHigh: "molten_steel"
  },
  dynamite: {
    name: "Dynamite",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 600,
    stateHigh: "explosion"
  },
  gunpowder: {
    name: "Gunpowder",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.POWDER,
    category: "weapons",
    state: "solid",
    density: 1700,
    tempHigh: 600,
    stateHigh: "explosion"
  },
  firework: {
    name: "Firework",
    color: "#c44f45",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 2000
  },
  nuke: {
    name: "Nuke",
    color: "#534636",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1500
  },
  h_bomb: {
    name: "H bomb",
    color: "#533636",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1600
  },
  dirty_bomb: {
    name: "Dirty bomb",
    color: "#415336",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1400
  },
  emp_bomb: {
    name: "Emp bomb",
    color: "#418273",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1400
  },
  fireball: {
    name: "Fireball",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1600,
    tempLow: -100,
    stateLow: "rock"
  },
  rocket: {
    name: "Rocket",
    color: "#ff6f47",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 7300
  },
  antibomb: {
    name: "Antibomb",
    color: "#adb3be",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 4300
  },
  cold_bomb: {
    name: "Cold bomb",
    color: "#43646e",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 1455.5,
    stateHigh: "molten_steel"
  },
  hot_bomb: {
    name: "Hot bomb",
    color: "#6c436e",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300
  },
  antimatter_bomb: {
    name: "Antimatter bomb",
    color: "#6e4343",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 10455.5,
    stateHigh: "molten_steel"
  },
  party_popper: {
    name: "Party popper",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300
  },
  flashbang: {
    name: "Flashbang",
    color: "#65665c",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 1455.5,
    stateHigh: "molten_steel"
  },
  smoke_grenade: {
    name: "Smoke grenade",
    color: "#65665c",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 7300,
    tempHigh: 1455.5,
    stateHigh: "molten_steel"
  },
  landmine: {
    name: "Landmine",
    color: "#856c7d",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300,
    tempHigh: 1455.5,
    stateHigh: "molten_steel"
  },
  earthquake: {
    name: "Earthquake",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 100000000
  },
  blaster: {
    name: "Blaster",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 100000000
  },
  armageddon: {
    name: "Armageddon",
    color: "#a62900",
    behavior: "WALL",
    category: "weapons",
    state: "solid",
    density: 1300
  },
  pressure_plate: {
    name: "Pressure plate",
    color: "#8a8a84",
    behavior: "WALL",
    category: "machines",
    state: "solid",
    density: 7850
  },
  fire: {
    name: "Fire",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.1,
    tempHigh: 7000,
    tempLow: 100,
    stateHigh: "plasma",
    stateLow: "smoke"
  },
  steam: {
    name: "Steam",
    color: "#abd6ff",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.6,
    tempLow: 95,
    stateLow: "water"
  },
  smoke: {
    name: "Smoke",
    color: "#383838",
    behavior: BEHAVIOR_TYPES.DGAS,
    category: "gases",
    state: "gas",
    density: 0.1,
    tempHigh: 1000,
    stateHigh: "fire"
  },
  plasma: {
    name: "Plasma",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.DGAS,
    category: "energy",
    state: "gas",
    density: 1,
    tempLow: 5000,
    stateLow: "fire"
  },
  cold_fire: {
    name: "Cold fire",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.1,
    tempHigh: 0,
    stateHigh: "smoke"
  },
  sun: {
    name: "Sun",
    color: "#ffffbd",
    behavior: "WALL",
    category: "special",
    state: "gas",
    density: 1408,
    tempLow: -100,
    stateLow: "supernova"
  },
  plague: {
    name: "Plague",
    color: "#36005c",
    behavior: "WALL",
    category: "life",
    state: "gas",
    density: 600,
    tempHigh: 300
  },
  antifire: {
    name: "Antifire",
    color: "#888888",
    behavior: "WALL",
    category: "special",
    state: "gas",
    density: 0.2,
    tempHigh: 7000,
    tempLow: 100,
    stateHigh: "plasma",
    stateLow: "antigas"
  },
  antigas: {
    name: "Antigas",
    color: "#e6fffc",
    behavior: "WALL",
    category: "special",
    state: "gas",
    density: 10,
    tempHigh: 1000,
    tempLow: 100,
    stateHigh: "antifire",
    stateLow: "antifluid"
  },
  light: {
    name: "Light",
    color: "#fffdcf",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.00001,
    tempLow: -273
  },
  liquid_light: {
    name: "Liquid light",
    color: "#bdbc9d",
    behavior: "behaviors.SUPERFLUID",
    category: "energy",
    state: "gas",
    density: 0.00002,
    stateHigh: "light"
  },
  laser: {
    name: "Laser",
    color: "#ff0000",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.00001,
    tempLow: -273
  },
  pointer: {
    name: "Pointer",
    color: "#ff0000",
    behavior: "WALL",
    category: "special",
    state: "gas",
    density: 1
  },
  hydrogen: {
    name: "Hydrogen",
    color: "#ff69b4",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.08375,
    tempLow: -253,
    stateLow: "liquid_hydrogen"
  },
  oxygen: {
    name: "Oxygen",
    color: "#00bfff",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.292,
    tempLow: -183.94,
    stateLow: "liquid_oxygen"
  },
  nitrogen: {
    name: "Nitrogen",
    color: "#9370db",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.165,
    tempLow: -195.8,
    stateLow: "liquid_nitrogen"
  },
  helium: {
    name: "Helium",
    color: "#ff1493",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.1786,
    tempLow: -272.2,
    stateLow: "liquid_helium"
  },
  anesthesia: {
    name: "Anesthesia",
    color: "#d3e1e3",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.9781,
    tempHigh: 600,
    tempLow: -88.48
  },
  carbon_dioxide: {
    name: "Carbon dioxide",
    color: "#8b008b",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.977,
    tempLow: -78.5,
    stateLow: "dry_ice"
  },
  bubble: {
    name: "Bubble",
    color: "#afc7fa",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 1.294,
    tempHigh: 200,
    tempLow: -10
  },
  ammonia: {
    name: "Ammonia",
    color: "#bab6a9",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.73,
    tempLow: -33.34
  },
  propane: {
    name: "Propane",
    color: "#cfcfcf",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 2.0098,
    tempHigh: 600,
    tempLow: -43,
    stateHigh: "fire"
  },
  methane: {
    name: "Methane",
    color: "#32cd32",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.554,
    tempHigh: 537,
    tempLow: -161.5,
    stateHigh: "fire"
  },
  foam: {
    name: "Foam",
    color: "#cad2e3",
    behavior: "WALL",
    category: "liquids",
    state: "gas",
    density: 40,
    tempLow: -78.5
  },
  acid_gas: {
    name: "Acid gas",
    color: "#888888",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 1.29,
    tempLow: 30,
    stateLow: "acid"
  },
  antimatter: {
    name: "Antimatter",
    color: "#a89ba8",
    behavior: "WALL",
    category: "special",
    state: "gas",
    density: 2.1
  },
  dioxin: {
    name: "Dioxin",
    color: "#b8b8b8",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.977
  },
  chlorine: {
    name: "Chlorine",
    color: "#00ff00",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 3.2,
    tempLow: -36.04,
    stateLow: "liquid_chlorine"
  },
  neon: {
    name: "Neon",
    color: "#bababa",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 0.9002,
    tempLow: -246,
    stateLow: "liquid_neon"
  },
  smog: {
    name: "Smog",
    color: "#989398",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 590.3,
    tempLow: 47.5,
    stateLow: "dirty_water"
  },
  stench: {
    name: "Stench",
    color: "#6ab066",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 1.293,
    tempHigh: 1000,
    tempLow: -15,
    stateHigh: "fire"
  },
  fragrance: {
    name: "Fragrance",
    color: "#967bb6",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 1.292,
    tempHigh: 1000,
    tempLow: -15,
    stateHigh: "fire"
  },
  ozone: {
    name: "Ozone",
    color: "#80a4ff",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 2.14,
    tempLow: -112
  },
  cloud: {
    name: "Cloud",
    color: "#d5dce6",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.4,
    tempLow: 100,
    stateLow: "rain_cloud"
  },
  rain_cloud: {
    name: "Rain cloud",
    color: "#636b78",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.5,
    tempHigh: 100,
    tempLow: 0,
    stateHigh: "cloud",
    stateLow: "snow_cloud"
  },
  snow_cloud: {
    name: "Snow cloud",
    color: "#7e8691",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.55,
    tempHigh: 30,
    tempLow: -200,
    stateHigh: "rain_cloud",
    stateLow: "hail_cloud"
  },
  hail_cloud: {
    name: "Hail cloud",
    color: "#7e8691",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.6,
    stateHigh: "snow_cloud"
  },
  thunder_cloud: {
    name: "Thunder cloud",
    color: "#494f5b",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.55,
    tempLow: 0,
    stateLow: "snow_cloud"
  },
  acid_cloud: {
    name: "Acid cloud",
    color: "#637865",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.7
  },
  sandstorm: {
    name: "Sandstorm",
    color: "#c2b576",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.8
  },
  pyrocumulus: {
    name: "Pyrocumulus",
    color: "#2e2e2e",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.7
  },
  fire_cloud: {
    name: "Fire cloud",
    color: "#888888",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.8,
    tempLow: 100,
    stateLow: "pyrocumulus"
  },
  rad_cloud: {
    name: "Rad cloud",
    color: "#888888",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.5
  },
  rad_steam: {
    name: "Rad steam",
    color: "#abffe4",
    behavior: "WALL",
    category: "gases",
    state: "gas",
    density: 0.7,
    tempLow: 10,
    stateLow: "fallout"
  },
  color_smoke: {
    name: "Color smoke",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.977
  },
  spray_paint: {
    name: "Spray paint",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.GAS,
    category: "gases",
    state: "gas",
    density: 1.977
  },
  radiation: {
    name: "Radiation",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1.5
  },
  neutron: {
    name: "Neutron",
    color: "#a6ffff",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.00003
  },
  proton: {
    name: "Proton",
    color: "#ffa6a6",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.00002
  },
  electric: {
    name: "Electric",
    color: "#fffba6",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 2.1
  },
  lightning: {
    name: "Lightning",
    color: "#ffffed",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1000,
    tempLow: -273
  },
  bless: {
    name: "Bless",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 0.001
  },
  god_ray: {
    name: "God ray",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1
  },
  heat_ray: {
    name: "Heat ray",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1
  },
  freeze_ray: {
    name: "Freeze ray",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1
  },
  pop: {
    name: "Pop",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1000
  },
  explosion: {
    name: "Explosion",
    color: "#888888",
    behavior: BEHAVIOR_TYPES.WALL,
    category: "energy",
    state: "gas",
    density: 1000
  },
  n_explosion: {
    name: "N explosion",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1000
  },
  supernova: {
    name: "Supernova",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1000
  },
  positron: {
    name: "Positron",
    color: "#a6bfff",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 2.1
  },
  ember: {
    name: "Ember",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 600,
    tempLow: 0,
    stateLow: "ash"
  },
  fw_ember: {
    name: "Fw ember",
    color: "#888888",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 700,
    tempLow: 0,
    stateLow: "carbon_dioxide"
  },
  flash: {
    name: "Flash",
    color: "#fffdcf",
    behavior: "WALL",
    category: "energy",
    state: "gas",
    density: 1,
    tempLow: -270
  },
  tornado: {
    name: "Tornado",
    color: "#888888",
    behavior: "WALL",
    category: "weapons",
    state: "gas",
    density: 1.23
  }
};

// Export by state for convenience
export const LIQUID_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'liquid')
);

export const SOLID_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'solid')
);

export const GAS_MATERIALS = Object.fromEntries(
  Object.entries(ALL_SANDBOXELS_MATERIALS).filter(([_, m]) => m.state === 'gas')
);
