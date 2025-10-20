import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { ZiplineRetailJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class ZiplineRetailScraper {
  private driver: WebDriver;

  constructor(private db = new ZiplineRetailJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.ZiplineRetailJobCreateInput[]> {
    await this.driver.get("https://retail-zipline.breezy.hr/");

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const jobElements = await this.driver.findElements(
      By.xpath(
        ".//ul[@class='positions']//li[@class='position-details flex-0']//a"
      )
    );
    let jobData: Prisma.ZiplineRetailJobCreateInput[] = [];
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const jobElement = (
          await this.driver.findElements(
            By.xpath(
              ".//ul[@class='positions']//li[@class='position-details flex-0']//a"
            )
          )
        )[i];
        const title = await jobElement.findElement(By.xpath(".//h2")).getText();
        const locationElements = await jobElement.findElements(
          By.xpath(".//span")
        );
        const location =
          locationElements.length === 3
            ? (await locationElements[0].getText()) +
              (await locationElements[1].getText()) +
              ", " +
              (await locationElements[2].getText())
            : locationElements.length === 2
            ? (await locationElements[0].getText()) +
              (await locationElements[1].getText())
            : await locationElements[0].getText();
        const href = await jobElement.getAttribute("href");
        jobData.push({
          title,
          location,
          href,
        });
      } catch (error) {
        console.error(`Error fetching job element at index ${i}:`, error);
        break;
      }
    }
    // console.log(`Scraped ${jobData.length} jobs from ZiplineRetail.`);
    // console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.ZiplineRetailJobCreateInput[]
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
      "Zipline Retail",
      "http://www.getzipline.com/",
      1
    );
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new ZiplineRetailScraper();
    const jobData = await scraper.scrapeJobs();
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

// ZiplineRetailScraper.run().then((result) => {
//   buildMessage(result.channel, result.blocks);
// });
