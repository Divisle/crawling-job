import { Prisma, PrismaClient } from "@prisma/client";
import { TeleportJobRepository } from "./database";
import { buildTeleportJobMessage } from "../template";
import { buildMessage } from "../global";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

export class TeleportJobHandler {
  private driver: WebDriver;

  constructor(private db = new TeleportJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.TeleportJobCreateInput[]> {
    await this.driver.get("https://goteleport.com/careers/#jobs");
    const listTeamElements = await this.driver.findElements(
      By.xpath("//li[contains(@class, 'sc-45b5350e-1')]")
    );
    const data: Prisma.TeleportJobCreateInput[] = [];
    for (const teamElement of listTeamElements) {
      const teamName = await teamElement.findElement(By.css("h3")).getText();
      const listJobs = await teamElement.findElements(By.css("ul li"));
      for (const jobElement of listJobs) {
        const title = await jobElement.findElement(By.css("a h4")).getText();
        const href = await jobElement
          .findElement(By.css("a"))
          .getAttribute("href");
        const location = await jobElement
          .findElement(By.xpath(".//p[contains(@class, 'iBctCo')]"))
          .getText();
        const type = await jobElement
          .findElement(By.xpath(".//p[contains(@class, 'jYstAY')]"))
          .getAttribute("innerText");
        data.push({ teamName, title, href, location, type });
      }
    }
    return data;
  }

  async filterData(data: Prisma.TeleportJobCreateInput[]) {
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
    newJobs: Prisma.TeleportJobCreateInput[];
    updateJobs: Prisma.TeleportJobCreateInput[];
    deleteJobs: Prisma.TeleportJobCreateInput[];
  }) {
    const blocks = buildTeleportJobMessage(data);
    await buildMessage(1, blocks);
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new TeleportJobHandler();
    const jobData = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobData);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      await handler.close();
      return;
    }
    await handler.sendMessage(filteredData);
    await handler.close();
  }
}
