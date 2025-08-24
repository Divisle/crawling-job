import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { AnomaloJobRepository } from "./database";
import {
  buildDefaultJobMessage,
  DefaultJob,
  DefaultJobMessageData,
} from "../template";
import { WebClient } from "@slack/web-api";

export class AnomaloJobScraper {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new AnomaloJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.AnomaloJobCreateInput[]> {
    await this.driver.get("https://www.anomalo.com/careers/");
    const jobFeedWrapper = await this.driver.findElement(
      By.className("job-feed-wrapper")
    );
    const jobLinks = await jobFeedWrapper.findElements(By.xpath(".//a"));
    const jobData: Prisma.AnomaloJobCreateInput[] = [];
    for (const link of jobLinks) {
      const href = await link.getAttribute("href");
      const jobTitle = await link.findElement(By.className("single-job-title"));
      const jobTitleText = await jobTitle.getText();
      const jobLocation = await link.findElement(By.className("location"));
      const jobLocationText = await jobLocation.getText();
      const jobDepartment = await link.findElement(By.className("department"));
      const jobDepartmentText = await jobDepartment.getText();
      jobData.push({
        title: jobTitleText,
        location: jobLocationText,
        department: jobDepartmentText,
        href: href,
      });
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.AnomaloJobCreateInput[]
  ): Promise<DefaultJobMessageData> {
    const filterData = await this.db.compareData(jobData);
    if (filterData.newJobs.length !== 0) {
      await this.db.createMany(filterData.newJobs);
    }
    if (filterData.updateJobs.length !== 0) {
      await this.db.updateMany(
        filterData.updateJobs.map((job) => job.id),
        filterData.updateJobs
      );
    }
    if (filterData.deleteJobs.length !== 0) {
      await this.db.deleteMany(filterData.deleteJobs.map((job) => job.id));
    }
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
    const blockMessage = buildDefaultJobMessage(data);
    console.log(blockMessage);
    await this.app.chat.postMessage({
      channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      blocks: blockMessage,
    });
  }

  static async run() {
    const scraper = new AnomaloJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    await scraper.sendMessage(filteredData);
    await scraper.close();
  }

  async close() {
    await this.driver.quit();
  }
}
