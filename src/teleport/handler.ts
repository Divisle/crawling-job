import { Prisma, PrismaClient } from "@prisma/client";
import { TeleportJobRepository } from "./database";
import {
  // buildTeleportJobsMessage,
  TeleportApiPayload,
  // TeleportJobInterface,
} from "../template";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import { Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

export class TeleportJobHandler {
  private driver: WebDriver;
  private app: WebClient;
  constructor(private db = new TeleportJobRepository(new PrismaClient())) {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log("SLACK_BOT_TOKEN is not defined");
      return process.exit(1);
    }
    if (!process.env.SLACK_FIRST_CHANNEL_ID) {
      console.log("SLACK_FIRST_CHANNEL_ID is not defined");
      return process.exit(1);
    }
    this.app = new WebClient(process.env.SLACK_BOT_TOKEN);
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

  async scrapeJobs(): Promise<any[]> {
    await this.driver.get("https://goteleport.com/careers/#jobs");
    const listTeamElements = await this.driver.findElements(
      By.xpath("//li[contains(@class, 'sc-45b5350e-1')]")
    );
    console.log({ listTeamElements });
    for (const teamElement of listTeamElements) {
      const teamName = await teamElement.findElement(By.css("h3")).getText();
      const listJobs = await teamElement.findElements(By.css("ul li"));
      for (const jobElement of listJobs) {
        const title = await jobElement.findElement(By.css("a h4")).getText();
        const href = await jobElement
          .findElement(By.css("a"))
          .getAttribute("href");
        const location = await jobElement
          .findElement(By.xpath(".//p[contains(@class, 'iBctCo')]"))
          .getText();
        const type = await jobElement
          .findElement(By.xpath(".//p[contains(@class, 'jYstAY')]"))
          .getAttribute("innerText");
        console.log({ teamName, title, href, location, type });
      }
    }
    return [];
  }

  async filterData() {}

  async sendMessage() {}

  async close() {
    await this.driver.quit();
  }

  static async run() {
    const handler = new TeleportJobHandler();
    await handler.scrapeJobs();
    await handler.close();
  }
}

TeleportJobHandler.run();
