import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { OsiumJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class OsiumScraper {
  private driver: WebDriver;

  constructor(private db = new OsiumJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.OsiumJobCreateInput[]> {
    await this.driver.get("https://osium.ai/careers#job-position");

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const jobElements = await this.driver.findElements(
      By.xpath(".//div[@id='job-position']//div[@data-framer-name='Content']/.")
    );
    let jobData: Prisma.OsiumJobCreateInput[] = [];
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const jobElement = (
          await this.driver.findElements(
            By.xpath(
              ".//div[@id='job-position']//div[@data-framer-name='Content']/.."
            )
          )
        )[i];
        const meta = await jobElement.findElements(
          By.xpath(".//div[@data-framer-name='Content']//p")
        );
        const title = await meta[0].getText();
        const locationText = await meta[1].getText();
        const location =
          locationText.split("-").length > 1
            ? locationText.split("-")[1].trim()
            : locationText;
        const href = await jobElement
          .findElement(By.xpath(".//a"))
          .getAttribute("href");
        jobData.push({
          title,
          location: location.replaceAll("\n", " "),
          href,
        });
      } catch (error) {
        console.error(`Error fetching job element at index ${i}:`, error);
        break;
      }
    }
    // console.log(`Scraped ${jobData.length} jobs from Osium.`);
    // console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.OsiumJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Osium", "https://osium.ai/", 2);
    return { blocks, channel: 2 };
  }

  static async run() {
    const scraper = new OsiumScraper();
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

// OsiumScraper.run().then((result) => {
//   buildMessage(result.channel, result.blocks);
// });
