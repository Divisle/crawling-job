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
  NumericJobHandler,
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
  AntithesisJobHandler,
  GetbalanceScraper,
  BasetenScraper,
  BlinkOpsJobHandler,
  BlockaidScraper,
  BynderJobHandler,
  CastAIJobHandler,
  ChainguardJobHandler,
  CheckmarxScraper,
  CockroachLabsJobHandler,
  CognitionJobHandler,
  MerlinJobHandler,
  CynomiJobHandler,
  DeepsetScraper,
  FactoryScraper,
  ForterJobHandler,
  GroundcoverJobHandler,
  HaiiloJobHandler,
  HebbiaJobHandler,
  HoneycombJobHandler,
  IncidentJobHandler,
  IslandJobHandler,
  KurrentJobHandler,
  LaunchDarklyJobHandler,
  MablJobHandler,
  MazeJobHandler,
  MergeJobHandler,
  MetalBearJobHandler,
  MindtickleJobHandler,
  NavanJobHandler,
  OasisSecurityJobHandler,
  OctopusJobHandler,
  OpalJobHandler,
  OrcaAIScraper,
  PlaxidityxJobHandler,
  RedwoodJobHandler,
  ScytaleJobHandler,
  SingleStoreJobHandler,
  SnorkelAIJobHandler,
  TraceBitJobHandler,
  UserTestingJobHandler,
  VegaJobHandler,
  VezaJobHandler,
  WatershedJobHandler,
  WorkOSJobHandler,
  YoobicScraper,
} from "./src";
import { buildMessage } from "./src/global";

async function test_message() {
  const active_channel_blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "This is a test message from the job scraper to active channel !",
      },
    },
  ];

  const prospect_channel_blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "This is a test message from the job scraper to prospect channel !",
      },
    },
  ];

  // Send to active channel
  console.log("Sending test message to active channel...");
  await buildMessage(2, active_channel_blocks);

  // Send to prospect channel
  console.log("Sending test message to prospect channel...");
  await buildMessage(1, prospect_channel_blocks);
}

async function runScraperSafely(
  scraperName: string,
  scraperFunction: () => Promise<{
    blocks: any[];
    channel: number;
  }>
): Promise<{
  blocks: any[];
  channel: number;
  status: boolean;
}> {
  console.time(scraperName);
  try {
    const result = await scraperFunction();
    console.log(`✅ ${scraperName} completed successfully`);
    return {
      blocks: result.blocks,
      channel: result.channel,
      status: true,
    };
  } catch (error) {
    console.error(`❌ ${scraperName} failed with error:`);
    console.error(
      `Error message: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    console.log(`⏭️  Continuing to next scraper...`);
    return {
      blocks: [],
      channel: 0,
      status: false,
    };
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
    { name: "Numeric", run: () => NumericJobHandler.run() },
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
    { name: "Antithesis", run: () => AntithesisJobHandler.run() },
    { name: "GetBalance", run: () => GetbalanceScraper.run() },
    { name: "Baseten", run: () => BasetenScraper.run() },
    { name: "BlinkOps", run: () => BlinkOpsJobHandler.run() },
    { name: "Blockaid", run: () => BlockaidScraper.run() },
    { name: "Bynder", run: () => BynderJobHandler.run() },
    { name: "CastAI", run: () => CastAIJobHandler.run() },
    { name: "Chainguard", run: () => ChainguardJobHandler.run() },
    { name: "Checkmarx", run: () => CheckmarxScraper.run() },
    { name: "CockroachLabs", run: () => CockroachLabsJobHandler.run() },
    { name: "Cognition", run: () => CognitionJobHandler.run() },
    { name: "Merlin", run: () => MerlinJobHandler.run() },
    { name: "Cynomi", run: () => CynomiJobHandler.run() },
    { name: "Deepset", run: () => DeepsetScraper.run() },
    { name: "Factory", run: () => FactoryScraper.run() },
    { name: "Forter", run: () => ForterJobHandler.run() },
    { name: "Groundcover", run: () => GroundcoverJobHandler.run() },
    { name: "Haiilo", run: () => HaiiloJobHandler.run() },
    { name: "Hebbia", run: () => HebbiaJobHandler.run() },
    { name: "Honeycomb", run: () => HoneycombJobHandler.run() },
    { name: "Incident", run: () => IncidentJobHandler.run() },
    { name: "Island", run: () => IslandJobHandler.run() },
    { name: "Kurrent", run: () => KurrentJobHandler.run() },
    { name: "LaunchDarkly", run: () => LaunchDarklyJobHandler.run() },
    { name: "Mabl", run: () => MablJobHandler.run() },
    { name: "Maze", run: () => MazeJobHandler.run() },
    { name: "Merge", run: () => MergeJobHandler.run() },
    { name: "MetalBear", run: () => MetalBearJobHandler.run() },
    { name: "MindTickle", run: () => MindtickleJobHandler.run() },
    { name: "Navan", run: () => NavanJobHandler.run() },
    { name: "OasisSecurity", run: () => OasisSecurityJobHandler.run() },
    { name: "Octopus", run: () => OctopusJobHandler.run() },
    { name: "Opal", run: () => OpalJobHandler.run() },
    { name: "OrcaAI", run: () => OrcaAIScraper.run() },
    { name: "PlaxidityX", run: () => PlaxidityxJobHandler.run() },
    { name: "Redwood", run: () => RedwoodJobHandler.run() },
    { name: "Scytale", run: () => ScytaleJobHandler.run() },
    { name: "SingleStore", run: () => SingleStoreJobHandler.run() },
    { name: "SnorkelAI", run: () => SnorkelAIJobHandler.run() },
    { name: "TraceBit", run: () => TraceBitJobHandler.run() },
    { name: "UserTesting", run: () => UserTestingJobHandler.run() },
    { name: "Vega", run: () => VegaJobHandler.run() },
    { name: "Veza", run: () => VezaJobHandler.run() },
    { name: "Watershed", run: () => WatershedJobHandler.run() },
    { name: "WorkOS", run: () => WorkOSJobHandler.run() },
    { name: "Yoobic", run: () => YoobicScraper.run() },
  ];

  console.log(`📊 Total scrapers to run: ${scrapers.length}`);
  console.log("─".repeat(50));
  const messageBlocks1: any[] = [];
  let messageChannel1 = 0;
  const messageBlocks2: any[] = [];
  let messageChannel2 = 0;
  for (const scraper of scrapers) {
    const result = await runScraperSafely(scraper.name, scraper.run);
    if (result.status) {
      successCount++;
      if (result.channel === 1) {
        messageBlocks1.push(...result.blocks);
        messageChannel1++;
      } else {
        messageBlocks2.push(...result.blocks);
        messageChannel2++;
      }
    } else {
      errorCount++;
    }
  }
  // Send all accumulated messages at once
  if (messageBlocks1.length > 0) {
    console.log(
      `📨 Sending accumulated message to channel 1 with ${messageBlocks1.length} blocks from ${messageChannel1} scrapers.`
    );
    try {
      await buildMessage(1, messageBlocks1);
    } catch (error) {
      console.error("💥 Failed to send message to channel 1:", error);
    }
  } else {
    console.log("📭 No messages to send to channel 1.");
  }
  if (messageBlocks2.length > 0) {
    console.log(
      `📨 Sending accumulated message to channel 2 with ${messageBlocks2.length} blocks from ${messageChannel2} scrapers.`
    );
    try {
      await buildMessage(2, messageBlocks2);
    } catch (error) {
      console.error("💥 Failed to send message to channel 2:", error);
    }
  } else {
    console.log("📭 No messages to send to channel 2.");
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

// main().catch((error) => {
//   console.error("💥 Main function failed:", error);
//   process.exit(1);
// });

test_message().catch((error) => {
  console.error("💥 Test message function failed:", error);
  process.exit(1);
});
