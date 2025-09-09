import { Prisma, PrismaClient } from "@prisma/client";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { OperantaiJobRepository } from "./database";
import { buildDefaultJobMessage, DefaultJobMessageData } from "../template";
import { buildMessage } from "../global";

export class OperantaiJobScraper {
  private driver: WebDriver;

  constructor(private db = new OperantaiJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.OperantaiJobCreateInput[]> {
    await this.driver.get("https://job-boards.greenhouse.io/operantai");

    // Add wait for page to load
    await this.driver.sleep(2000);

    const jobData: Prisma.OperantaiJobCreateInput[] = [];

    try {
      // Get department count first, then iterate by index
      const departmentElements = await this.driver.findElements(
        By.xpath("//div[@class='job-posts--table--department']")
      );

      for (
        let deptIndex = 0;
        deptIndex < departmentElements.length;
        deptIndex++
      ) {
        try {
          // Re-find department element each time to avoid stale reference
          const currentDepartmentElements = await this.driver.findElements(
            By.xpath("//div[@class='job-posts--table--department']")
          );

          if (deptIndex >= currentDepartmentElements.length) {
            console.log(`Department ${deptIndex} no longer exists, skipping`);
            continue;
          }

          const departmentElement = currentDepartmentElements[deptIndex];

          // Get department name
          const department = await departmentElement
            .findElement(By.xpath(".//h3"))
            .getText();

          // Get job elements count for this department
          const listJobElements = await departmentElement.findElements(
            By.xpath(".//tbody//tr")
          );

          // Iterate through jobs by index to avoid stale references
          for (
            let jobIndex = 0;
            jobIndex < listJobElements.length;
            jobIndex++
          ) {
            try {
              // Re-find department and job elements each time
              const freshDepartmentElements = await this.driver.findElements(
                By.xpath("//div[@class='job-posts--table--department']")
              );

              if (deptIndex >= freshDepartmentElements.length) {
                console.log(
                  `Department ${deptIndex} disappeared, breaking inner loop`
                );
                break;
              }

              const freshDepartmentElement = freshDepartmentElements[deptIndex];
              const freshJobElements =
                await freshDepartmentElement.findElements(
                  By.xpath(".//tbody//tr")
                );

              if (jobIndex >= freshJobElements.length) {
                console.log(
                  `Job ${jobIndex} in department ${deptIndex} no longer exists, skipping`
                );
                continue;
              }

              const jobElement = freshJobElements[jobIndex];

              // Extract job data
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
            } catch (jobError) {
              console.error(
                `Error processing job ${jobIndex} in department ${department}:`,
                jobError
              );
              // Continue to next job
            }
          }
        } catch (deptError) {
          console.error(`Error processing department ${deptIndex}:`, deptError);
          // Continue to next department
        }
      }
    } catch (error) {
      console.error("Error in scrapeJobs:", error);
      throw error;
    }

    return jobData;
  }

  async filterData(
    jobData: Prisma.OperantaiJobCreateInput[]
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
      "Operantai",
      "https://operant.ai/"
    );
    await buildMessage(2, blocks);
  }

  static async run() {
    const scraper = new OperantaiJobScraper();
    try {
      const jobData = await scraper.scrapeJobs();
      const filteredData = await scraper.filterData(jobData);
      if (
        filteredData.newJobs.length === 0 &&
        filteredData.updateJobs.length === 0 &&
        filteredData.deleteJobs.length === 0
      ) {
        console.log("No job changes detected.");
        return;
      }
      await scraper.sendMessage(filteredData);
    } finally {
      await scraper.close();
    }
  }

  async close() {
    if (this.driver) {
      try {
        await this.driver.quit();
      } catch (error) {
        console.log("Error closing driver:", error);
      }
    }
  }
}
