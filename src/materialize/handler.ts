import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { MaterializeJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { buildMessage } from "../global";

export class MaterializeJobScraper {
  private driver: WebDriver;

  constructor(private db = new MaterializeJobRepository(new PrismaClient())) {
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
    options.addArguments("--disable-extensions");
    options.addArguments("--disable-plugins");

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Set timeouts
    this.driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
  }

  async scrapeJobs(): Promise<Prisma.MaterializeJobCreateInput[]> {
    await this.driver.get("https://materialize.com/careers/");
    // Wait for the page to load completely
    await this.driver.sleep(3000);

    // Wait for job sections to be present with explicit wait
    console.log("Waiting for job sections to load...");
    await this.driver.wait(
      until.elementsLocated(By.xpath("//div[@class='svelte-z5mc0o']")),
      15000
    );

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const departmentElements = await this.driver.findElements(
      By.xpath("//div[@class='svelte-z5mc0o']")
    );
    const jobData: Prisma.MaterializeJobCreateInput[] = [];
    for (const departmentElement of departmentElements) {
      const department = await departmentElement
        .findElement(By.css("h3"))
        .getText();
      const jobElements = await departmentElement.findElements(By.css("a"));
      for (const jobElement of jobElements) {
        const href = await jobElement.getAttribute("href");
        const jobContents = await jobElement.findElements(By.css("div p"));
        const title = await jobContents[0].getText();
        const location = await jobContents[1].getText();
        jobData.push({
          title,
          location,
          department,
          href,
        });
      }
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.MaterializeJobCreateInput[]
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
      "Materialize",
      "https://materialize.com/"
    );
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new MaterializeJobScraper();
    const jobData = await scraper.scrapeJobs();
    // console.log(`Scraped ${jobData.length} jobs from Materialize.`);
    // console.log(jobData);
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

// MaterializeJobScraper.run();
