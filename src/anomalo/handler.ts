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
  constructor(
    private db = new AnomaloJobRepository(new PrismaClient()),
    private app = new WebClient(process.env.SLACK_BOT_TOKEN)
  ) {
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
    await this.db.createMany(filterData.newJobs);
    await this.db.updateMany(
      filterData.updateJobs.map((job) => job.id),
      filterData.updateJobs
    );
    await this.db.deleteMany(filterData.deleteJobs.map((job) => job.id));
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
    this.app.chat.postMessage({
      channel: "C098K61KNLT",
      blocks: blockMessage,
    });
  }

  async close() {
    await this.driver.quit();
  }
}
export async function test() {
  const scraper = new AnomaloJobScraper();
  scraper.sendMessage({
    newJobs: [],
    deleteJobs: [],
    updateJobs: [],
  });
  // await scraper.scrapeJobs();
  // await scraper.close();
}

test();
