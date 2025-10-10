import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { FactoryJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { buildMessage } from "../global";

export class FactoryScraper {
  private driver: WebDriver;

  constructor(private db = new FactoryJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.FactoryJobCreateInput[]> {
    await this.driver.get("https://factory.ai/company#careers");
    // Wait for the page to load completely
    await this.driver.sleep(3000);

    // Wait for job sections to be present with explicit wait
    console.log("Waiting for job sections to load...");
    await this.driver.wait(
      until.elementsLocated(By.xpath("//button[@title='Next page']")),
      15000
    );

    // Additional wait to ensure all content is loaded
    await this.driver.sleep(2000);

    let jobData: Prisma.FactoryJobCreateInput[] = [];
    // While button is not disabled
    while (true) {
      const jobElements = await this.driver.findElements(
        By.xpath("//section[@id='careers']//ul//a")
      );
      // Scroll to bottom to load all jobs, scroll slowly to ensure all jobs are loaded
      await this.driver.executeScript(
        "window.scrollTo(0, document.body.scrollHeight);"
      );
      await this.driver.sleep(2000);
      for (let i = 0; i < jobElements.length; i++) {
        try {
          const jobElement = (
            await this.driver.findElements(
              By.xpath("//section[@id='careers']//ul//a")
            )
          )[i];
          const meta = await jobElement.findElements(
            By.xpath(".//div[@class='flex flex-col gap-2']//p")
          );
          const title = meta[0] ? await meta[0].getText() : "No title";
          const location = meta[1]
            ? (await meta[1].getText()).split("-")[0].trim()
            : "No location";
          const href = await jobElement.getAttribute("href");
          jobData.push({
            title,
            location,
            href,
          });
        } catch (error) {
          console.error("Error scraping a job element:", error);
        }
      }
      const nextButton = await this.driver.findElement(
        By.xpath(".//button[@title='Next page']")
      );
      if (
        ((await nextButton.isEnabled()) && (await nextButton.isDisplayed())) ===
        false
      ) {
        break;
      } else {
        await this.driver.executeScript("arguments[0].click();", nextButton);
        await this.driver.sleep(1000);
      }
    }
    console.log(`Scraped ${jobData.length} jobs from Factory.`);
    console.log(jobData);
    return jobData;
  }

  async filterData(
    jobData: Prisma.FactoryJobCreateInput[]
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
    const blocks = buildJobMessage(data, "Factory", "https://factory.ai/", 1);
    return { blocks, channel: 1 };
  }

  static async run() {
    const scraper = new FactoryScraper();
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

FactoryScraper.run().then((result) => {
  buildMessage(result.channel, result.blocks);
});
