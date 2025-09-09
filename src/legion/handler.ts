import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { LegionJobRepository } from "./database";
import { buildLegionJobMessage } from "../template";
import { buildMessage } from "../global";

export class LegionJobScraper {
  private driver: WebDriver;
  constructor(private db = new LegionJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }

    const options = new Options();
    options.addArguments(
      `--user-data-dir=/tmp/chrome_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`
    );
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");
    options.addArguments(
      "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<Prisma.LegionJobCreateInput[]> {
    await this.driver.get("https://careers.legionsecurity.ai/");
    await this.driver.sleep(7000);
    const jobData: Prisma.LegionJobCreateInput[] = [];
    const aboutButtons = await this.driver.findElements(
      By.xpath("//div[contains(@class,'pseudoSelection')]//div[@role='button']")
    );
    for (const button of aboutButtons) {
      await button.click();
      await this.driver.sleep(250);
    }
    const listTables = await this.driver.findElements(
      By.xpath(
        "//div[@class='notion-selectable notion-sub_sub_header-block']//table"
      )
    );
    const listTitles = await this.driver.findElements(
      By.xpath("//div[@class='notion-selectable notion-sub_header-block']//h3")
    );
    if (
      listTables.length !== listTitles.length ||
      listTables.length !== aboutButtons.length
    ) {
      console.error("List length mismatch");
      process.exit(1);
    }
    for (let i = 0; i < aboutButtons.length; i++) {
      const title = await listTitles[i].getText();
      const columns = await listTables[i].findElements(By.xpath(".//td"));
      const location = (await columns[0].getText()).replace("Location: ", "");
      const type = (await columns[1].getText()).replace("Type: ", "");
      const compensation = (await columns[2].getText()).replace(
        "Compensation: ",
        ""
      );
      jobData.push({
        title,
        location,
        type,
        compensation,
        href: "https://careers.legionsecurity.ai/",
      });
    }
    return jobData;
  }

  async filterData(jobData: Prisma.LegionJobCreateInput[]): Promise<{
    newJobs: Prisma.LegionJobCreateInput[];
    updateJobs: Prisma.LegionJobCreateInput[];
    deleteJobs: Prisma.LegionJobCreateInput[];
  }> {
    const filterData = await this.db.compareData(jobData);
    const listDeleteId = [
      ...filterData.deleteJobs.map((job) => job.id!),
      ...filterData.updateJobs.map((job) => job.id!),
    ];
    const listNewData = [
      ...filterData.newJobs,
      ...filterData.updateJobs.map((job) => {
        const { id, ...rest } = job;
        return rest;
      }),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listNewData);

    return filterData;
  }

  async sendMessage(data: {
    newJobs: Prisma.LegionJobCreateInput[];
    updateJobs: Prisma.LegionJobCreateInput[];
    deleteJobs: Prisma.LegionJobCreateInput[];
  }) {
    const blocks = buildLegionJobMessage(data);
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new LegionJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      await scraper.close();
      return;
    }
    await scraper.sendMessage(filteredData);
    await scraper.close();
  }

  async close() {
    await this.driver.quit();
  }
}
