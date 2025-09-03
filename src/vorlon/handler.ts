import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { VorlonJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { WebClient } from "@slack/web-api";

export class VorlonJobScraper {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new VorlonJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.VorlonJobCreateInput[]> {
    await this.driver.get("https://vorlon.io/careers");
    const jobData: Prisma.VorlonJobCreateInput[] = [];
    const jobElements = await this.driver.findElements(By.xpath("//summary"));
    for (const jobElement of jobElements) {
      const title = await jobElement.findElement(By.xpath(".//h3")).getText();
      const href = "https://vorlon.io/careers";
      const department = await jobElement
        .findElement(By.xpath(".//div[@class='job']"))
        .getText();
      const location = await jobElement.findElement(By.xpath(".//p")).getText();
      jobData.push({ href, title, department, location });
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.VorlonJobCreateInput[]
  ): Promise<DefaultJobMessageData> {
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

    const messageData = {
      newJobs: filterData.newJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
      deleteJobs: filterData.deleteJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
      updateJobs: filterData.updateJobs.map((e) => {
        return {
          title: e.title,
          location: e.location,
          department: e.department,
          href: e.href,
        };
      }),
    };
    return messageData;
  }

  async sendMessage(data: DefaultJobMessageData) {
    const blockMessage = buildDefaultJobMessage(
      data,
      "Vorlon",
      "https://vorlon.io/"
    );
    await this.app.chat.postMessage({
      // channel: process.env.SLACK_TEST_CHANNEL_ID!,
      channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      blocks: blockMessage,
    });
  }

  static async run() {
    const scraper = new VorlonJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    await scraper.sendMessage(filteredData);
    await scraper.close();
  }

  async close() {
    await this.driver.quit();
  }
}

VorlonJobScraper.run();
