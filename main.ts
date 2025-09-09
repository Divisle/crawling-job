import {
  AbnormalJobScraper,
  AnomaloJobScraper,
  CardinalopsJobScraper,
  ChecklyJobHandler,
  CredoJobHandler,
  DashJobHandler,
  DoxelJobHandler,
  EndorLabsJobScraper,
  EnterpretJobScraper,
  FarSightJobHandler,
  FluidStackJobHandler,
  FormantJobScraper,
  HightouchJobScraper,
  IoJobHandler,
  LaurelJobHandler,
  LegionJobScraper,
  LeptonJobScraper,
  LoopJobHandler,
  LumosJobScraper,
  MaraTalentHandler,
  MaterializeJobScraper,
  NumericJobScraper,
  OmneaJobHandler,
  OperantaiJobScraper,
  PivotalJobScraper,
  PortJobScraper,
  RecruitmentJobHandler,
  RelyanceJobHandler,
  RoboFlowJobScraper,
  SafeJobHandler,
  SeeChangeJobHandler,
  SysdigJobHandler,
  TeleportJobHandler,
  VoizeJobHandler,
  VorlonJobScraper,
  WebaiJobHandler,
} from "./src";

async function runScraperSafely(
  scraperName: string,
  scraperFunction: () => Promise<void>
): Promise<boolean> {
  console.time(scraperName);
  try {
    await scraperFunction();
    console.log(`✅ ${scraperName} completed successfully`);
    return true; // Success
  } catch (error) {
    console.error(`❌ ${scraperName} failed with error:`);
    console.error(
      `Error message: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    console.log(`⏭️  Continuing to next scraper...`);
    return false; // Failed
  } finally {
    console.timeEnd(scraperName);
  }
}

async function main() {
  console.log("🚀 Starting job scrapers...");
  console.log(`Started at: ${new Date().toISOString()}`);
  console.time("Total Scraping Time");

  let successCount = 0;
  let errorCount = 0;

  const scrapers = [
    { name: "Abnormal", run: () => AbnormalJobScraper.run() },
    { name: "Anomalo", run: () => AnomaloJobScraper.run() },
    { name: "Cardinalops", run: () => CardinalopsJobScraper.run() },
    { name: "Checkly", run: () => ChecklyJobHandler.run() },
    { name: "Credo", run: () => CredoJobHandler.run() },
    { name: "Dash", run: () => DashJobHandler.run() },
    { name: "Doxel", run: () => DoxelJobHandler.run() },
    { name: "EndorLabs", run: () => EndorLabsJobScraper.run() },
    { name: "Enterpret", run: () => EnterpretJobScraper.run() },
    { name: "FarSight", run: () => FarSightJobHandler.run() },
    { name: "FluidStack", run: () => FluidStackJobHandler.run() },
    { name: "Formant", run: () => FormantJobScraper.run() },
    { name: "Hightouch", run: () => HightouchJobScraper.run() },
    { name: "Io", run: () => IoJobHandler.run() },
    { name: "Laurel", run: () => LaurelJobHandler.run() },
    { name: "Legion", run: () => LegionJobScraper.run() },
    { name: "Lepton", run: () => LeptonJobScraper.run() },
    { name: "Loop", run: () => LoopJobHandler.run() },
    { name: "Lumos", run: () => LumosJobScraper.run() },
    { name: "MaraTalent", run: () => MaraTalentHandler.run() },
    { name: "Materialize", run: () => MaterializeJobScraper.run() },
    { name: "Numeric", run: () => NumericJobScraper.run() },
    { name: "Omnea", run: () => OmneaJobHandler.run() },
    { name: "Operantai", run: () => OperantaiJobScraper.run() },
    { name: "Pivotal", run: () => PivotalJobScraper.run() },
    { name: "Port", run: () => PortJobScraper.run() },
    { name: "Recruitment", run: () => RecruitmentJobHandler.run() },
    { name: "Relyance", run: () => RelyanceJobHandler.run() },
    { name: "RoboFlow", run: () => RoboFlowJobScraper.run() },
    { name: "Safe", run: () => SafeJobHandler.run() },
    { name: "SeeChange", run: () => SeeChangeJobHandler.run() },
    { name: "Sysdig", run: () => SysdigJobHandler.run() },
    { name: "Teleport", run: () => TeleportJobHandler.run() },
    { name: "Voize", run: () => VoizeJobHandler.run() },
    { name: "Vorlon", run: () => VorlonJobScraper.run() },
    { name: "Webai", run: () => WebaiJobHandler.run() },
  ];

  console.log(`📊 Total scrapers to run: ${scrapers.length}`);
  console.log("─".repeat(50));

  for (const scraper of scrapers) {
    const success = await runScraperSafely(scraper.name, scraper.run);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log("─".repeat(50));
  console.timeEnd("Total Scraping Time");
  console.log(`📈 Scraping Summary:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(
    `  📊 Success Rate: ${((successCount / scrapers.length) * 100).toFixed(1)}%`
  );
  console.log(`🏁 All job scrapers completed at: ${new Date().toISOString()}`);
}

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("💥 Main function failed:", error);
  process.exit(1);
});
