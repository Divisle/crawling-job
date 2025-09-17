import { Prisma, PrismaClient } from "@prisma/client";
import { MaraTalentRepository } from "./database";
import {
  buildJobMessage,
  buildMaraTalentJobMessage,
  JobMessageData,
} from "../template";
import { buildMessage } from "../global";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

export class MaraTalentHandler {
  private driver: WebDriver;
  constructor(private db = new MaraTalentRepository(new PrismaClient())) {
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
    // options.addArguments("--disable-blink-features=AutomationControlled");
    // options.addArguments("--disable-extensions");
    // options.addArguments("--no-first-run");
    // options.addArguments("--disable-default-apps");
    options.addArguments(
      "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    // options.excludeSwitches("enable-automation");
    // options.addArguments("--disable-web-security");
    // options.addArguments("--allow-running-insecure-content");

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<Prisma.MaraTalentJobCreateInput[]> {
    await this.driver.get("https://www.maratalent.co.uk/jobs/");
    const data: Prisma.MaraTalentJobCreateInput[] = [];
    await this.driver.sleep(3000);
    const listJobElements = await this.driver.findElements(
      By.xpath("//div[@class='job_listings']//ul//a")
    );
    for (const jobElement of listJobElements) {
      const title = await jobElement.findElement(By.xpath(".//h3")).getText();
      const company = await jobElement
        .findElement(By.xpath(".//strong"))
        .getText();
      const location = await jobElement
        .findElement(By.xpath(".//div[@class='location']"))
        .getText();
      const href = await jobElement.getAttribute("href");
      data.push({ title, company, location, href });
    }
    return data;
  }

  async filterData(data: Prisma.MaraTalentJobCreateInput[]) {
    const filteredData = await this.db.compareData(data);
    const listDeleteId = [
      ...filteredData.deleteJobs.map((job) => job.id as string),
      ...filteredData.updateJobs.map((job) => job.id as string),
    ];
    const listCreateData = [
      ...filteredData.newJobs,
      ...filteredData.updateJobs.map((job) => {
        const { id, ...jobData } = job;
        return jobData;
      }),
    ];
    await this.db.deleteMany(listDeleteId);
    await this.db.createMany(listCreateData);
    return filteredData;
  }

  async sendMessage(data: {
    newJobs: Prisma.MaraTalentJobCreateInput[];
    updateJobs: Prisma.MaraTalentJobCreateInput[];
    deleteJobs: Prisma.MaraTalentJobCreateInput[];
  }) {
    const jobDatas: JobMessageData[] = data.newJobs.map((job) => ({
      location: job.location,
      title: job.title,
      href: job.href,
    }));
    const blocks = buildJobMessage(
      jobDatas,
      "Mara Talent",
      "https://www.maratalent.co.uk/",
      2
    );
    return { blocks, channel: 2 };
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new MaraTalentHandler();
    const jobData = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobData);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      await handler.close();
      return { blocks: [] as any[], channel: 0 };
    }
    await handler.close();
    return await handler.sendMessage(filteredData);
  }
}
