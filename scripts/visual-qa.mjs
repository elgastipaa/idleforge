import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:3000";
const OUT_DIR = process.env.VISUAL_QA_OUT ?? "/tmp/relic-forge-visual-qa";
const SAVE_KEY = "relic-forge-idle:v1";
const FIXED_THEME = "dark";

const viewports = {
  mobile360: { width: 360, height: 780 },
  tablet768: { width: 768, height: 900 },
  desktop1440: { width: 1440, height: 960 }
};

const screens = [
  { name: "expeditions", label: null },
  { name: "claim-result", label: null, claim: true },
  { name: "hero", label: "Hero" },
  { name: "inventory", label: "Inventory" },
  { name: "forge", label: "Forge" },
  { name: "town", label: "Town" },
  { name: "dailies", label: "Dailies" },
  { name: "reincarnation", label: "Rebirth" },
  { name: "settings", label: "Save" }
];

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const fallback = "/tmp/pw/node_modules/playwright/index.mjs";
    if (fs.existsSync(fallback)) {
      return await import(pathToFileURL(fallback).href);
    }
    throw new Error("Playwright is not installed. Install it locally or provide /tmp/pw/node_modules/playwright.");
  }
}

function makeItem({ id, name, slot, rarity, itemLevel, upgradeLevel, stats, affixes }) {
  return {
    id,
    name,
    slot,
    rarity,
    itemLevel,
    upgradeLevel,
    stats,
    affixes,
    sellValue: 240 + itemLevel * 18,
    salvageValue: { ore: 18 + itemLevel, crystal: rarity === "common" ? 0 : 4, rune: rarity === "legendary" ? 2 : 0, relicFragment: rarity === "legendary" ? 3 : 0 },
    sourceDungeonId: "copper-crown-champion",
    createdAtRunId: 4
  };
}

function makeScenarioSave(now) {
  const longName = "World-Anvil Guildstone of Emberheart Crown Hunger and Very Long Forge QA Naming";
  const equippedWeapon = makeItem({
    id: "qa-equipped-weapon",
    name: "Runesung Warblade of Might",
    slot: "weapon",
    rarity: "rare",
    itemLevel: 8,
    upgradeLevel: 2,
    stats: { power: 36, defense: 4, speed: 2, luck: 3, stamina: 12 },
    affixes: [{ id: "might", name: "Might", stats: { power: 8 }, description: "+Power" }]
  });
  const inventory = [
    makeItem({
      id: "qa-long-legendary",
      name: longName,
      slot: "relic",
      rarity: "legendary",
      itemLevel: 16,
      upgradeLevel: 4,
      stats: { power: 44, defense: 10, speed: 8, luck: 18, stamina: 24 },
      affixes: [
        { id: "emberheart", name: "Emberheart", stats: { power: 5, luck: 4 }, description: "+Power, +Luck, +8% Gold in Emberwood" },
        { id: "crown-hunger", name: "Crown Hunger", stats: { power: 4 }, description: "+10% boss rewards" },
        { id: "deep-breath", name: "Deep Breath", stats: { stamina: 18 }, description: "-12% Vigor boost cost" }
      ]
    }),
    makeItem({
      id: "qa-epic-helm",
      name: "Storm-Vowed Crown of Blue Spark",
      slot: "helm",
      rarity: "epic",
      itemLevel: 14,
      upgradeLevel: 1,
      stats: { power: 18, defense: 26, speed: 4, luck: 13, stamina: 18 },
      affixes: [{ id: "blue-spark", name: "Blue Spark", stats: { luck: 5 }, description: "+Rare drop chance" }]
    }),
    makeItem({
      id: "qa-rare-boots",
      name: "Moon-Etched Trailstriders of Fast Roads",
      slot: "boots",
      rarity: "rare",
      itemLevel: 11,
      upgradeLevel: 0,
      stats: { power: 8, defense: 7, speed: 28, luck: 5, stamina: 16 },
      affixes: [{ id: "fleetstrider", name: "Fleetstrider", stats: { speed: 5, stamina: 10 }, description: "+Speed, +Stamina, -3% expedition duration" }]
    }),
    makeItem({
      id: "qa-common-armor",
      name: "Tempered Guardmail",
      slot: "armor",
      rarity: "common",
      itemLevel: 7,
      upgradeLevel: 0,
      stats: { power: 5, defense: 18, speed: 1, luck: 1, stamina: 30 },
      affixes: []
    })
  ];

  return {
    game: "Relic Forge Idle",
    saveVersion: 1,
    exportedAt: now,
    state: {
      version: 1,
      seed: "visual-qa-seed",
      mode: "standard",
      createdAt: now - 500000,
      updatedAt: now,
      nextRunId: 6,
      hero: {
        name: "Visual QA Warden",
        classId: "warrior",
        level: 12,
        xp: 1420,
        baseStats: { power: 43, defense: 42, speed: 15, luck: 14, stamina: 247 }
      },
      resources: { gold: 1250000, ore: 98765, crystal: 4321, rune: 222, relicFragment: 150, renown: 18 },
      vigor: { current: 37, max: 40, lastTickAt: now },
      inventory,
      equipment: { weapon: equippedWeapon, helm: null, armor: null, boots: null, relic: null },
      activeExpedition: { dungeonId: "tollroad-of-trinkets", runId: 5, startedAt: now - 20000, endsAt: now + 1000, vigorBoost: true },
      dungeonClears: {
        "tollroad-of-trinkets": 3,
        "mossbright-cellar": 2,
        "relic-bandit-cache": 2,
        "copper-crown-champion": 1,
        "lanternroot-path": 1,
        "saffron-sigil-grove": 1
      },
      town: { forge: 4, mine: 2, tavern: 2, library: 1, market: 2, shrine: 1 },
      dailies: {
        windowStartAt: now - 10000,
        nextResetAt: now + 3600000,
        lastTaskSetKey: "visual-qa",
        tasks: [
          { id: "qa-daily-1", kind: "complete_expeditions", label: "Complete expeditions", target: 3, progress: 3, claimed: false, reward: { gold: 250, materials: { ore: 20 }, vigor: 2 } },
          { id: "qa-daily-2", kind: "salvage_items", label: "Salvage items", target: 2, progress: 1, claimed: false, reward: { gold: 150, materials: { crystal: 4 }, vigor: 1 } },
          { id: "qa-daily-3", kind: "upgrade_building", label: "Upgrade a building", target: 1, progress: 1, claimed: true, reward: { gold: 200, materials: {}, vigor: 1 } }
        ]
      },
      achievements: {},
      prestige: { totalPrestiges: 1, renownEarned: 22, upgrades: { guildLegacy: 1, swiftCharters: 1, treasureOath: 0, bossAttunement: 0 } },
      lifetime: {
        expeditionsStarted: 18,
        expeditionsSucceeded: 15,
        expeditionsFailed: 3,
        bossesDefeated: 1,
        totalGoldEarned: 42000,
        totalItemsFound: 18,
        totalItemsSold: 4,
        totalItemsSalvaged: 5,
        totalItemsCrafted: 2,
        totalDailyClaims: 1,
        legendaryItemsFound: 1,
        highestPowerScore: 180,
        highestLevel: 12,
        finalBossClears: 0
      },
      settings: { reducedMotion: false, debugBalance: false, onboardingDismissed: true, heroCreated: true }
    }
  };
}

async function openScenarioPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const save = JSON.stringify(makeScenarioSave(Date.now()));
  await context.addInitScript(
    ({ saveKey, saveValue }) => {
      window.localStorage.setItem(saveKey, saveValue);
      window.localStorage.setItem("relic-forge-idle:theme", "dark");
    },
    { saveKey: SAVE_KEY, saveValue: save }
  );
  const page = await context.newPage();
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Relic Forge Idle");
  return { context, page };
}

async function captureScreen(page, viewportName, screen) {
  if (screen.label) {
    await page.getByRole("button", { name: new RegExp(`^${screen.label}$`, "i") }).click({ force: true });
    await page.waitForTimeout(150);
  }
  if (screen.claim) {
    if ((await page.getByText("Expedition Result").count()) === 0) {
      await page.waitForTimeout(2000);
      const claimButton = page.getByRole("button", { name: /Claim Expedition/i });
      if ((await claimButton.count()) > 0) {
        await claimButton.click({ force: true });
      }
    }
    await page.waitForSelector("text=Expedition Result");
  }

  const fileName = `${viewportName}-${FIXED_THEME}-${screen.name}.png`;
  const filePath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });

  const metrics = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 180) : "",
          text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((entry) => entry.right > clientWidth + 1 || entry.left < -1)
      .sort((a, b) => Math.max(b.right - clientWidth, -b.left) - Math.max(a.right - clientWidth, -a.left))
      .slice(0, 8);
    return {
      clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders,
      text: document.body.innerText.slice(0, 240)
    };
  });
  const overflow = Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) - metrics.clientWidth;
  return { screen: screen.name, screenshot: filePath, overflow, metrics };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const [viewportName, viewport] of Object.entries(viewports)) {
      const { context, page } = await openScenarioPage(browser, viewport);
      try {
        for (const screen of screens) {
          results.push({ viewport: viewportName, theme: FIXED_THEME, ...(await captureScreen(page, viewportName, screen)) });
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const failures = results.filter((result) => result.overflow > 1);
  const reportPath = path.join(OUT_DIR, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ appUrl: APP_URL, generatedAt: new Date().toISOString(), results, failures }, null, 2));
  console.log(`Visual QA report: ${reportPath}`);
  console.log(`Screenshots: ${OUT_DIR}`);

  if (failures.length > 0) {
    console.error(`Horizontal overflow detected in ${failures.length} capture(s).`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
