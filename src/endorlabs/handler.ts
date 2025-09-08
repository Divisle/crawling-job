import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { EndorLabsJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { buildMessage } from "../global";

export class EndorLabsJobScraper {
  private driver: WebDriver;
  constructor(private db = new EndorLabsJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.EndorLabsJobCreateInput[]> {
    await this.driver.get("https://job-boards.greenhouse.io/endorlabs");
    // this.driver.manage().setTimeouts({ implicit: 5000 });
    const departmentElements = await this.driver.findElements(
      By.xpath("//div[@class='job-posts--table--department']")
    );
    const jobData: Prisma.EndorLabsJobCreateInput[] = [];
    for (const departmentElement of departmentElements) {
      const department = await departmentElement
        .findElement(By.xpath(".//h3"))
        .getText();
      const listJobElements = await departmentElement.findElements(
        By.xpath(".//tbody//tr")
      );
      const rowCount = (await this.driver.findElements(By.css("tr"))).length;
      for (let i = 0; i < rowCount; i++) {
        const jobElement = (await this.driver.findElements(By.css("tr")))[i];
        const href = await jobElement
          .findElement(By.xpath(".//a"))
          .getAttribute("href");
        const title = await jobElement
          .findElement(By.xpath(".//p[@class='body body--medium']"))
          .getText();
        const location = await jobElement
          .findElement(
            By.xpath(".//p[@class='body body__secondary body--metadata']")
          )
          .getText();

        jobData.push({ href, title, location, department });
      }
    }
    return jobData;
  }

  async filterData(
    jobData: Prisma.EndorLabsJobCreateInput[]
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
      "EndorLabs",
      "https://www.endorlabs.com/"
    );
    await buildMessage(1, blocks);
  }

  static async run() {
    const scraper = new EndorLabsJobScraper();
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
