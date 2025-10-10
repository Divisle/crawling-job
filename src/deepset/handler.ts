import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { DeepsetJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class DeepsetScraper {
  private driver: WebDriver;

  constructor(private db = new DeepsetJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.DeepsetJobCreateInput[]> {
    await this.driver.get("https://www.deepset.ai/careers");
    // Wait for the page to load completely
    await this.driver.sleep(3000);

    // Wait for job sections to be present with explicit wait
    console.log("Waiting for job sections to load...");
    await this.driver.wait(
      until.elementsLocated(
        By.xpath(".//div[@class='c-careers-listings_item w-dyn-item']")
      ),
      15000
    );

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const jobElements = await this.driver.findElements(
      By.xpath(".//div[@class='c-careers-listings_item w-dyn-item']")
    );
    let jobData: Prisma.BlockaidJobCreateInput[] = [];
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const jobElements = await this.driver.findElements(
          By.xpath(".//div[@class='c-careers-listings_item w-dyn-item']")
        );
        const jobElement = jobElements[i];
        const href = await jobElement
          .findElement(By.xpath(".//a"))
          .getAttribute("href");
        const title = await jobElement.findElement(By.xpath(".//h2")).getText();
        const locationElements = await jobElement.findElements(
          By.xpath(
            ".//div[@class='c-careers-listings_item_text-cols']//div[@role='listitem']//div[@class='c-text-3']"
          )
        );
        const location =
          locationElements.length > 0
            ? (
                await Promise.all(locationElements.map((el) => el.getText()))
              ).join("; ")
            : "N/A";
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
    console.log(`Scraped ${jobData.length} jobs from Deepset.`);
    console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.DeepsetJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Deepset", "https://deepset.ai/", 1);
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new DeepsetScraper();
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

DeepsetScraper.run().then((result) => {
  buildMessage(result.channel, result.blocks);
});
