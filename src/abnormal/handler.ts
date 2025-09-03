import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { AbnormalJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { WebClient } from "@slack/web-api";

export class AbnormalJobScraper {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new AbnormalJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.AbnormalJobCreateInput[]> {
    await this.driver.get("https://abnormal.ai/careers/open-roles");
    const jobData: Prisma.AbnormalJobCreateInput[] = [];
    const listJob = await this.driver.findElements(
      By.xpath("//a[@class='ρd__all ρd__a ρam9Q']")
    );

    for (const jobElement of listJob) {
      const href = await jobElement.getAttribute("href");
      const title = await jobElement
        .findElement(By.xpath(".//div[@class='ρd__all ρd__div ρt ρwo6MQ']"))
        .getText();
      const department = await jobElement
        .findElement(By.xpath(".//div[@class='ρd__all ρd__div ρt ρbUeqD']"))
        .getText();
      const location = await jobElement
        .findElement(By.xpath(".//div[@class='ρd__all ρd__div ρt ρbkRhz']"))
        .getText();
      jobData.push({ href, title, department, location });
    }
    // Remove duplicates
    const uniqueJobData = Array.from(
      new Map(jobData.map((job) => [job.href, job])).values()
    );
    return uniqueJobData;
  }

  async filterData(
    jobData: Prisma.AbnormalJobCreateInput[]
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
      "Abnormal",
      "http://abnormalsecurity.com"
    );
    await this.app.chat.postMessage({
      // channel: process.env.SLACK_TEST_CHANNEL_ID!,
      channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      blocks: blockMessage,
    });
  }

  static async run() {
    const scraper = new AbnormalJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    await scraper.sendMessage(filteredData);
    await scraper.close();
  }

  async close() {
    await this.driver.quit();
  }
}

AbnormalJobScraper.run();
