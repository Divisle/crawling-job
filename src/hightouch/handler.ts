import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { HightouchJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { buildMessage } from "../global";

export class HightouchJobScraper {
  private driver: WebDriver;
  constructor(private db = new HightouchJobRepository(new PrismaClient())) {
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

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<Prisma.HightouchJobCreateInput[]> {
    await this.driver.get("https://hightouch.com/careers");
    const jobData: Prisma.HightouchJobCreateInput[] = [];
    const departmentElements = await this.driver.findElements(
      By.xpath("//div[@class='css-uw4lqx']//div[@class='css-0']")
    );
    for (const departmentElement of departmentElements) {
      const department = await departmentElement
        .findElement(By.xpath(".//h3"))
        .getText();
      const jobElements = await departmentElement.findElements(
        By.xpath(".//a")
      );
      for (const jobElement of jobElements) {
        const title = await jobElement
          .findElement(By.xpath(".//p[@class='chakra-text css-2ygcmq']"))
          .getText();
        const href = await jobElement.getAttribute("href");
        const location = await jobElement
          .findElement(By.xpath(".//p[@class='chakra-text css-17vbnw2']"))
          .getText();
        jobData.push({ href, title, department, location });
      }
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.HightouchJobCreateInput[]
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
      "Hightouch",
      "https://hightouch.com/"
    );
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new HightouchJobScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
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
