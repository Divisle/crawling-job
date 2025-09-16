import { PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { NumericJobRepository } from "./database";
import { buildNumericJobMessage, NumericJobInterface } from "../template";
import { buildMessage } from "../global";

export class NumericJobScraper {
  private driver: WebDriver;

  constructor(private db = new NumericJobRepository(new PrismaClient())) {
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

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }

  async scrapeJobs(): Promise<any[]> {
    await this.driver.get("https://www.numeric.io/accounting-careers-board");
    // Find a div one class is "acc-careers_list"
    const jobFeedWrapper = await this.driver.findElement(
      By.className("acc-careers_list")
    );
    const jobElements = await jobFeedWrapper.findElements(
      By.xpath(".//div[@class='acc-careers_list-item']")
    );
    const jobData: NumericJobInterface[] = [];
    for (const jobElement of jobElements) {
      let data: NumericJobInterface = {
        company: "",
        address: "",
        title: "",
        location_type: "",
        department: "",
        time: "",
        href: "",
        tags: [],
      };
      const headBlock = await jobElement.findElements(
        By.xpath(".//div[@class='acc-careers_job-company-wrap']//div//div")
      );
      if (headBlock.length === 2) {
        data.company = await headBlock[0].getText();
        data.address = await headBlock[1].getText();
      }
      data.title = await jobElement.findElement(By.xpath(".//h3")).getText();
      data.href = await jobElement
        .findElement(By.xpath(".//a"))
        .getAttribute("href");
      const bodyBlock = await jobElement.findElements(
        By.className("acc-careers_job-features")
      );
      if (bodyBlock.length === 3) {
        data.location_type = await bodyBlock[0].getText();
        data.department = await bodyBlock[1].getText();
        data.time = await bodyBlock[2].getText();
      }
      // Find element contain class 'acc-careers_job-tags'
      const tagBlock = await jobElement.findElements(
        By.xpath(".//div[@class= 'acc-careers_job-tag']")
      );
      for (const tagElement of tagBlock) {
        data.tags.push(await tagElement.getText());
      }
      jobData.push(data);
    }
    return jobData;
  }

  async filterData(jobData: NumericJobInterface[]): Promise<{
    newJobs: NumericJobInterface[];
    deleteJobs: NumericJobInterface[];
    updateJobs: NumericJobInterface[];
  }> {
    const filterData = await this.db.compareData(jobData);

    await this.db.deleteMany(
      filterData.deleteJobs
        .filter((job) => job.id !== undefined)
        .map((job) => job.id!)
    );
    await this.db.deleteMany(
      filterData.updateJobs
        .filter((job) => job.id !== undefined)
        .map((job) => job.id!)
    );
    await this.db.createMany(filterData.newJobs);
    await this.db.createMany(filterData.updateJobs);
    return filterData;
  }

  async sendMessage(messageData: {
    newJobs: NumericJobInterface[];
    deleteJobs: NumericJobInterface[];
    updateJobs: NumericJobInterface[];
  }) {
    const blocks = buildNumericJobMessage(messageData);
    return { blocks, channel: 2 };
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const scraper = new NumericJobScraper();
    const data = await scraper.scrapeJobs();
    const filteredData = await scraper.filterData(data);
    if (
      filteredData.newJobs.length === 0 &&
      filteredData.updateJobs.length === 0 &&
      filteredData.deleteJobs.length === 0
    ) {
      console.log("No job changes detected.");
      await scraper.close();
      return { blocks: [] as any[], channel: 0 };
    }
    await scraper.close();
    return await scraper.sendMessage(filteredData);
  }
}
NumericJobScraper.run().then((res) => {
  if (res.blocks.length === 0) {
    console.log("No job updates found.");
    process.exit(0);
  }
  buildMessage(1, res.blocks);
});
