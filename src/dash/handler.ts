import { Prisma, PrismaClient } from "@prisma/client";
import { DashJobRepository } from "./database";
import { WebClient } from "@slack/web-api";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { buildDashJobMessage } from "../template";

export class DashJobHandler {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new DashJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.DashJobCreateInput[]> {
    const data: Prisma.DashJobCreateInput[] = [];
    this.driver.get("https://careers.dash0.com/");
    const listJobs = await this.driver.findElements(
      By.xpath(
        "//a[@class='JobListItems__lightTile__6OKw0 JobListItems__tile__0rOxB']"
      )
    );
    for (const job of listJobs) {
      const href = await job.getAttribute("href");
      const title = await job
        .findElement(By.xpath(".//p[@class='JobListItems__jobTitle__6cPrj']"))
        .getText();
      const jobInfomations = await job.findElements(
        By.xpath(".//p[@class='JobListItems__listItemInfoText__RdxZL']")
      );
      const location = await jobInfomations[1].getText();
      const employmentType = await jobInfomations[0].getText();

      data.push({ href, title, location, employmentType });
    }
    return data;
  }

  async filterData(data: Prisma.DashJobCreateInput[]) {
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
    newJobs: Prisma.DashJobCreateInput[];
    updateJobs: Prisma.DashJobCreateInput[];
    deleteJobs: Prisma.DashJobCreateInput[];
  }) {
    const blocks = buildDashJobMessage(data);
    await this.app.chat.postMessage({
      channel: process.env.SLACK_FIRST_CHANNEL_ID!,
      // channel: process.env.SLACK_TEST_CHANNEL_ID!,
      blocks,
    });
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new DashJobHandler();
    const jobData = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobData);
    await handler.sendMessage(filteredData);
    await handler.close();
  }
}

DashJobHandler.run();
