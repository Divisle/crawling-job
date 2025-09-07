import { Prisma, PrismaClient } from "@prisma/client";
import { DoxelJobRepository } from "./database";
import { buildLeverJobMessage } from "../template";
import { buildMessage } from "../global";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

export class DoxelJobHandler {
  private driver: WebDriver;
  constructor(private db = new DoxelJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.DoxelJobCreateInput[]> {
    await this.driver.get("https://jobs.lever.co/doxel");
    const data: Prisma.DoxelJobCreateInput[] = [];
    const teamName = await this.driver
      .findElement(
        By.xpath(".//div[contains(@class, 'posting-category-title')]")
      )
      .getText();
    const jobElements = await this.driver.findElements(
      By.xpath(".//div[@class='posting']")
    );
    for (const jobElement of jobElements) {
      const href = await jobElement
        .findElement(By.css("a"))
        .getAttribute("href");
      const title = await jobElement.findElement(By.css("h5")).getText();
      const workplaceType = (
        await jobElement
          .findElement(By.xpath(".//span[contains(@class, 'workplaceTypes')]"))
          .getText()
      ).replace(" — ", "");
      const employmentType = await jobElement
        .findElement(By.xpath(".//span[contains(@class, 'commitment')]"))
        .getText();
      const location = await jobElement
        .findElement(By.xpath(".//span[contains(@class, 'location')]"))
        .getText();
      data.push({
        department: teamName,
        title,
        href,
        location,
        workplaceType,
        employmentType,
      });
    }
    return data;
  }

  async filterData(data: Prisma.DoxelJobCreateInput[]) {
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
    newJobs: Prisma.DoxelJobCreateInput[];
    updateJobs: Prisma.DoxelJobCreateInput[];
    deleteJobs: Prisma.DoxelJobCreateInput[];
  }) {
    const blocks = buildLeverJobMessage(data, "Doxel", "https://doxel.com/");
    await buildMessage(1, blocks);
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new DoxelJobHandler();
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
