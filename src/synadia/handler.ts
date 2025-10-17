import { Prisma, PrismaClient } from "@prisma/client";
import { SynadiaJobRepository } from "./database";
import { buildJobMessage, JobMessageData } from "../template";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { buildMessage } from "../global";

export class SynadiaJobHandler {
  private driver: WebDriver;

  constructor(private db = new SynadiaJobRepository(new PrismaClient())) {
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

  async scrapeJobs(): Promise<Prisma.SynadiaJobCreateInput[]> {
    await this.driver.get("https://www.synadia.com/careers");
    const data: Prisma.SynadiaJobCreateInput[] = [];
    const listElements = await this.driver.findElements(
      By.xpath(
        "//div[@id='opportunities']//a[@class='flex-grow font-semibold text-zinc-50']"
      )
    );
    for (let i = 0; i < listElements.length; i++) {
      const jobElement = (
        await this.driver.findElements(
          By.xpath(
            "//div[@id='opportunities']//a[@class='flex-grow font-semibold text-zinc-50']"
          )
        )
      )[i];
      const href = await jobElement.getAttribute("href");
      const title = await jobElement.getText();
      const location = await jobElement
        .findElement(By.xpath("..//span"))
        .getText();
      data.push({ title, location, href });
    }
    // console.log(`Scraped ${data.length} jobs from Synadia Security`);
    // console.log(data);
    return data;
  }

  async filterData(data: Prisma.SynadiaJobCreateInput[]) {
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
    return filteredData.newJobs;
  }

  async sendMessage(data: Prisma.SynadiaJobCreateInput[]) {
    const jobs: JobMessageData[] = data.map((jobData) => {
      return {
        location: jobData.location,
        title: jobData.title,
        href: jobData.href,
      };
    });
    const blocks = buildJobMessage(
      jobs,
      "Synadia",
      "https://www.synadia.com/",
      2
    );
    return { blocks, channel: 2 };
  }

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new SynadiaJobHandler();
    const jobData = await handler.scrapeJobs();
    const filteredData = await handler.filterData(jobData);
    if (filteredData.length === 0) {
      console.log("No job changes detected.");
      await handler.close();
      return { blocks: [] as any[], channel: 0 };
    }
    await handler.close();
    return await handler.sendMessage(filteredData);
  }
}

// SynadiaJobHandler.run().then((res) => {
//   if (res.blocks.length > 0) {
//     buildMessage(res.channel, res.blocks);
//   }
// });
