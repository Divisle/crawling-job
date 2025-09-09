import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { CardinalopsJobRepository } from "./database";
import { buildCardinalopsJobMessage } from "../template";
import { buildMessage } from "../global";

export class CardinalopsJobScraper {
  private driver: WebDriver;
  constructor(private db = new CardinalopsJobRepository(new PrismaClient())) {
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
    options.addArguments("--disable-blink-features=AutomationControlled");
    options.addArguments("--disable-extensions");
    options.addArguments(
      "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    options.excludeSwitches("enable-automation");
    options.addArguments("--disable-web-security");
    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<Prisma.CardinalopsJobCreateInput[]> {
    await this.driver.get("https://cardinalops.com/careers");
    await this.driver.sleep(7000);
    const jobData: Prisma.CardinalopsJobCreateInput[] = [];
    const departmentDivs = await this.driver.findElements(
      By.xpath("//div[@id='d']//div[@class='comeet-g-r']")
    );
    for (const departmentDiv of departmentDivs) {
      const department = await departmentDiv
        .findElement(
          By.xpath(".//div[@class='comeet-list comeet-group-name']//a")
        )
        .getText();
      const listJobs = await departmentDiv.findElements(By.xpath(".//li//a"));
      for (const job of listJobs) {
        const data: Prisma.CardinalopsJobCreateInput = {
          title: await job
            .findElement(By.xpath(".//div[@class='comeet-position-name']"))
            .getText(),
          department,
          meta: await job
            .findElement(By.xpath(".//div[@class='comeet-position-meta']"))
            .getText(),
          href: await job.getAttribute("href"),
        };
        jobData.push(data);
      }
    }
    return jobData;
  }

  async filterData(jobData: Prisma.CardinalopsJobCreateInput[]): Promise<{
    newJobs: Prisma.CardinalopsJobCreateInput[];
    updateJobs: Prisma.CardinalopsJobCreateInput[];
    deleteJobs: Prisma.CardinalopsJobCreateInput[];
  }> {
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
          meta: e.meta,
          department: e.department,
          href: e.href,
        };
      }),
      deleteJobs: filterData.deleteJobs.map((e) => {
        return {
          title: e.title,
          meta: e.meta,
          department: e.department,
          href: e.href,
        };
      }),
      updateJobs: filterData.updateJobs.map((e) => {
        return {
          title: e.title,
          meta: e.meta,
          department: e.department,
          href: e.href,
        };
      }),
    };
    return messageData;
  }

  async sendMessage(data: {
    newJobs: Prisma.CardinalopsJobCreateInput[];
    updateJobs: Prisma.CardinalopsJobCreateInput[];
    deleteJobs: Prisma.CardinalopsJobCreateInput[];
  }) {
    const blocks = buildCardinalopsJobMessage(data);
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new CardinalopsJobScraper();
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
