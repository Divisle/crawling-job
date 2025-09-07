import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { RoboFlowJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { buildMessage } from "../global";

export class RoboFlowJobScraper {
  private driver: WebDriver;

  constructor(private db = new RoboFlowJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }

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

  async scrapeJobs(): Promise<Prisma.RoboFlowJobCreateInput[]> {
    await this.driver.get("https://roboflow.com/careers");
    const jobData: Prisma.RoboFlowJobCreateInput[] = [];
    const listJobCard = await this.driver.findElements(
      By.xpath("//a[@class='career-jobs-card w-inline-block']")
    );
    for (const jobCard of listJobCard) {
      const href = await jobCard.getAttribute("href");
      const title = await jobCard
        .findElement(By.xpath(".//div[@class='career-jobs-role']"))
        .getText();
      const department = await jobCard
        .findElements(By.xpath(".//div[@class='career-jobs-dept']"))
        .then((els) => (els.length > 0 ? els[0].getText() : null));
      const location = await jobCard
        .findElement(By.xpath(".//div[@class='career-jobs-location']"))
        .getText();
      jobData.push({ href, title, location, department });
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.RoboFlowJobCreateInput[]
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
    const blocks = buildDefaultJobMessage(
      data,
      "RoboFlow",
      "https://roboflow.com/"
    );
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new RoboFlowJobScraper();
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
