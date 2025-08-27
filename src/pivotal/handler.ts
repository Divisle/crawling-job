import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { PivotalJobRepository } from "./database";
import { WebClient } from "@slack/web-api";
import { buildPivotalJobMessage } from "../template";

export class PivotalJobScraper {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new PivotalJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
    this.app = new WebClient(process.env.SLACK_BOT_TOKEN);
    const options = new Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<Prisma.PivotalJobCreateInput[]> {
    await this.driver.get("https://pivotalpartners.io/jobs");
    // Find div class "table3_content-copy"
    const jobContainer = await this.driver.findElement(
      By.className("table3_content-copy")
    );
    // Find list job elements by div inside and role "listitem"
    const jobElements = await jobContainer.findElements(
      By.css("div[role='listitem']")
    );
    const jobData: Prisma.PivotalJobCreateInput[] = [];
    for (const jobElement of jobElements) {
      const href = await jobElement
        .findElement(By.xpath(".//a"))
        .getAttribute("href");
      const title = await jobElement
        .findElement(By.xpath(".//div[@class='post-short']"))
        .getText();
      const location = await jobElement
        .findElement(
          By.xpath(
            ".//div[@id='w-node-bb8bc452-078a-f50a-6655-909d7c053e3c-c01617e4']"
          )
        )
        .getText();

      jobData.push({
        href,
        title,
        location,
      });
    }
    return jobData;
  }

  async filterData(jobData: Prisma.PivotalJobCreateInput[]): Promise<{
    newJobs: Prisma.PivotalJobCreateInput[];
    deleteJobs: Prisma.PivotalJobCreateInput[];
    updateJobs: Prisma.PivotalJobCreateInput[];
  }> {
    const filteredData = await this.db.compareData(jobData);
    const listDeletedIds = [
      ...filteredData.deleteJobs.map((job) => job.id!),
      ...filteredData.updateJobs.map((job) => job.id!),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...rest } = job;
        return {
          ...rest,
        };
      }),
    ];
    await this.db.deleteMany(listDeletedIds);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(messageData: {
    newJobs: Prisma.PivotalJobCreateInput[];
    deleteJobs: Prisma.PivotalJobCreateInput[];
    updateJobs: Prisma.PivotalJobCreateInput[];
  }) {
    const blocks = await buildPivotalJobMessage(messageData);
    try {
      await this.app.chat.postMessage({
        // channel: process.env.SLACK_TEST_CHANNEL_ID!,
        channel: process.env.SLACK_FIRST_CHANNEL_ID!,
        blocks,
      });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const scraper = new PivotalJobScraper();
    const data = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(data);
    await scraper.sendMessage(filteredData);
    await scraper.close();
  }
}

PivotalJobScraper.run();
