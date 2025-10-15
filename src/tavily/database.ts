import { TavilyJob, Prisma, PrismaClient } from "@prisma/client";

export class TavilyJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TavilyJob[]> {
    return this.prisma.tavilyJob.findMany({});
  }

  async createMany(data: Prisma.TavilyJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.tavilyJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Tavily jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.tavilyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Tavily jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TavilyJobCreateInput[]) {
    const deleteJobs: Prisma.TavilyJobCreateInput[] = [];
    const updateJobs: Prisma.TavilyJobCreateInput[] = [];
    const newJobs: Prisma.TavilyJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.href === job.href);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
