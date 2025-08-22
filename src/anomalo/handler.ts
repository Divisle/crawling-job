import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { AnomaloJobRepository } from "./database";

export class AnomaloJobScraper {
  private driver: WebDriver;
  constructor(private db = new AnomaloJobRepository(new PrismaClient())) {
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

  async scrapeJobs() {
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
  }

  async close() {
    await this.driver.quit();
  }
}
async function test() {
  const scraper = new AnomaloJobScraper();
  await scraper.scrapeJobs();
  await scraper.close();
}

test();
