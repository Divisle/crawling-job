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
} from "./src";

async function main() {
  console.log("Starting job scrapers...");
  console.time("Total Scraping Time");
  console.time("Abnormal");
  await AbnormalJobScraper.run();
  console.timeEnd("Abnormal");
  console.time("Anomalo");
  await AnomaloJobScraper.run();
  console.timeEnd("Anomalo");
  console.time("Cardinalops");
  await CardinalopsJobScraper.run();
  console.timeEnd("Cardinalops");
  console.time("Checkly");
  await ChecklyJobHandler.run();
  console.timeEnd("Checkly");
  console.time("Credo");
  await CredoJobHandler.run();
  console.timeEnd("Credo");
  console.time("Dash");
  await DashJobHandler.run();
  console.timeEnd("Dash");
  console.time("Doxel");
  await DoxelJobHandler.run();
  console.timeEnd("Doxel");
  console.time("EndorLabs");
  await EndorLabsJobScraper.run();
  console.timeEnd("EndorLabs");
  console.time("Enterpret");
  await EnterpretJobScraper.run();
  console.timeEnd("Enterpret");
  console.time("FarSight");
  await FarSightJobHandler.run();
  console.timeEnd("FarSight");
  console.time("FluidStack");
  await FluidStackJobHandler.run();
  console.timeEnd("FluidStack");
  console.time("Formant");
  await FormantJobScraper.run();
  console.timeEnd("Formant");
  console.time("Hightouch");
  await HightouchJobScraper.run();
  console.timeEnd("Hightouch");
  console.time("Io");
  await IoJobHandler.run();
  console.timeEnd("Io");
  console.time("Laurel");
  await LaurelJobHandler.run();
  console.timeEnd("Laurel");
  console.time("Legion");
  await LegionJobScraper.run();
  console.timeEnd("Legion");
  console.time("Lepton");
  await LeptonJobScraper.run();
  console.timeEnd("Lepton");
  console.time("Loop");
  await LoopJobHandler.run();
  console.timeEnd("Loop");
  console.time("Lumos");
  await LumosJobScraper.run();
  console.timeEnd("Lumos");
  console.time("MaraTalent");
  await MaraTalentHandler.run();
  console.timeEnd("MaraTalent");
  console.time("Materialize");
  await MaterializeJobScraper.run();
  console.timeEnd("Materialize");
  console.time("Numeric");
  await NumericJobScraper.run();
  console.timeEnd("Numeric");
  console.time("Omnea");
  await OmneaJobHandler.run();
  console.timeEnd("Omnea");
  console.time("Operantai");
  await OperantaiJobScraper.run();
  console.timeEnd("Operantai");
  console.time("Pivotal");
  await PivotalJobScraper.run();
  console.timeEnd("Pivotal");
  console.time("Port");
  await PortJobScraper.run();
  console.timeEnd("Port");
  console.time("Recruitment");
  await RecruitmentJobHandler.run();
  console.timeEnd("Recruitment");
  console.time("Relyance");
  await RelyanceJobHandler.run();
  console.timeEnd("Relyance");
  console.time("RoboFlow");
  await RoboFlowJobScraper.run();
  console.timeEnd("RoboFlow");
  console.time("Safe");
  await SafeJobHandler.run();
  console.timeEnd("Safe");
  console.time("SeeChange");
  await SeeChangeJobHandler.run();
  console.timeEnd("SeeChange");
  console.time("Sysdig");
  await SysdigJobHandler.run();
  console.timeEnd("Sysdig");
  console.time("Teleport");
  await TeleportJobHandler.run();
  console.timeEnd("Teleport");
  console.time("Voize");
  await VoizeJobHandler.run();
  console.timeEnd("Voize");
  console.time("Vorlon");
  await VorlonJobScraper.run();
  console.timeEnd("Vorlon");

  console.timeEnd("Total Scraping Time");
  console.log("All job scrapers completed.");
}

main();
