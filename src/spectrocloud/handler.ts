import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { SpectrocloudJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class SpectrocloudScraper {
  private driver: WebDriver;

  constructor(private db = new SpectrocloudJobRepository(new PrismaClient())) {
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
    options.addArguments("--disable-extensions");
    options.addArguments("--disable-plugins");

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Set timeouts
    this.driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
  }

  async scrapeJobs(): Promise<Prisma.SpectrocloudJobCreateInput[]> {
    await this.driver.get("https://careers.spectrocloud.com/jobs");
    // Wait for the page to load completely
    await this.driver.sleep(3000);
    let jobData: Prisma.SpectrocloudJobCreateInput[] = [];

    const jobElements = await this.driver.executeScript<WebDriver[]>(
      `return Array.from(document.querySelectorAll("ul#jobs_list_container a"));`
    );
    for (const jobElement of jobElements) {
      const title = await this.driver.executeScript<string>(
        `return arguments[0].querySelector("div span.text-block-base-link.company-link-style.hyphens-auto").innerText;`,
        jobElement
      );
      const location = await this.driver.executeScript<string>(
        `return arguments[0].querySelectorAll("div div span:not([class])")[1].innerText;`,
        jobElement
      );
      const href = await this.driver.executeScript<string>(
        `return arguments[0].getAttribute("href");`,
        jobElement
      );
      jobData.push({ title, location, href });
    }
    // console.log(`Scraped ${jobData.length} jobs from Spectrocloud.`);
    // console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.SpectrocloudJobCreateInput[]
  ): Promise<JobMessageData[]> {
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
    return filterData.newJobs;
  }

  async sendMessage(data: JobMessageData[]) {
    const blocks = buildJobMessage(
      data,
      "Spectro Cloud",
      "https://www.spectrocloud.com/",
      1
    );
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new SpectrocloudScraper();
    const jobData = await scraper.scrapeJobs();
    // console.log(`Scraped ${jobData.length} jobs from Spectrocloud.`);
    // console.log(jobData);
    const filteredData = await scraper.filterData(jobData);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      await scraper.close();
      return { blocks: [] as any[], channel: 0 };
    }
    await scraper.close();
    return await scraper.sendMessage(filteredData);
  }

  async close() {
    await this.driver.quit();
  }
}

// SpectrocloudScraper.run().then((result) => {
//   buildMessage(result.channel, result.blocks);
// });
