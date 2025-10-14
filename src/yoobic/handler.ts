import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { YoobicJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class YoobicScraper {
  private driver: WebDriver;

  constructor(private db = new YoobicJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.YoobicJobCreateInput[]> {
    await this.driver.get("https://careers.yoobic.com/jobs");
    // Wait for the page to load completely
    await this.driver.sleep(3000);

    // Wait for job sections to be present with explicit wait
    console.log("Waiting for job sections to load...");
    await this.driver.wait(
      until.elementsLocated(By.xpath(".//ul[@id='jobs_list_container']")),
      15000
    );

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);
    const jobElements = await this.driver.findElements(
      By.xpath(".//ul[@id='jobs_list_container']//a")
    );
    let jobData: Prisma.YoobicJobCreateInput[] = [];
    for (let i = 0; i < jobElements.length; i++) {
      try {
        const jobElements = await this.driver.findElements(
          By.xpath(".//ul[@id='jobs_list_container']//a ")
        );
        const jobElement = jobElements[i];
        const href = await jobElement.getAttribute("href");
        const title = await this.driver.executeScript<string>(
          "return arguments[0].innerText;",
          jobElement
        );

        const metaElement = (
          await this.driver.findElements(
            By.xpath(".//ul[@id='jobs_list_container']//div/div")
          )
        )[i];
        // Find a span without class
        const locationElement = (
          await metaElement.findElements(By.xpath(".//span[not(@class)]"))
        )[1];
        const location = await this.driver.executeScript<string>(
          "return arguments[0].innerText;",
          locationElement
        );
        jobData.push({
          title,
          location,
          href,
        });
      } catch (error) {
        console.error(`Error fetching job element at index ${i}:`, error);
        break;
      }
    }
    // console.log(`Scraped ${jobData.length} jobs from Yoobic.`);
    // console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.YoobicJobCreateInput[]
  ): Promise<JobMessageData[]> {
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
    return filterData.newJobs;
  }

  async sendMessage(data: JobMessageData[]) {
    const blocks = buildJobMessage(data, "Yoobic", "http://www.yoobic.com/", 1);
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new YoobicScraper();
    const jobData = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(jobData);
    if (filteredData.length === 0) {
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

// YoobicScraper.run().then((result) => {
//   buildMessage(result.channel, result.blocks);
// });
