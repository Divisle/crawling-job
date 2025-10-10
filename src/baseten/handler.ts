import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { BasetenJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class BasetenScraper {
  private driver: WebDriver;

  constructor(private db = new BasetenJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.BasetenJobCreateInput[]> {
    await this.driver.get("https://jobs.ashbyhq.com/baseten");
    // Wait for the page to load completely
    await this.driver.sleep(3000);

    // Wait for job sections to be present with explicit wait
    console.log("Waiting for job sections to load...");
    await this.driver.wait(
      until.elementsLocated(By.xpath(".//a[@class=' _container_j2da7_1']")),
      15000
    );

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const jobElements = await this.driver.findElements(
      By.xpath(".//a[@class=' _container_j2da7_1']")
    );
    let jobData: Prisma.BasetenJobCreateInput[] = [];
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const jobElement = (
          await this.driver.findElements(
            By.xpath("//a[@class=' _container_j2da7_1']")
          )
        )[i];
        const title = await jobElement.findElement(By.xpath(".//h3")).getText();
        const location = (
          await jobElement
            .findElement(By.xpath(".//div//p[not(@class)]"))
            .getText()
        )
          .split("•")[1]
          .trim();
        const href = await jobElement.getAttribute("href");
        jobData.push({
          title: title.trim(),
          location: location,
          href: href.trim(),
        });
      } catch (error) {
        console.error(`Error processing job element at index ${i}:`, error);
        break;
      }
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.BasetenJobCreateInput[]
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
      "Baseten",
      "https://www.baseten.co",
      1
    );
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new BasetenScraper();
    const jobData = await scraper.scrapeJobs();
    // console.log(`Scraped ${jobData.length} jobs from Baseten.`);
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

// BasetenScraper.run().then((result) => {
//   buildMessage(result.channel, result.blocks);
// });
