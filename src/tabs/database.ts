import { TabsJob, Prisma, PrismaClient } from "@prisma/client";

export class TabsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TabsJob[]> {
    return this.prisma.tabsJob.findMany({});
  }

  async createMany(data: Prisma.TabsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.tabsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Tabs jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.tabsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Tabs jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TabsJobCreateInput[]) {
    const deleteJobs: Prisma.TabsJobCreateInput[] = [];
    const updateJobs: Prisma.TabsJobCreateInput[] = [];
    const newJobs: Prisma.TabsJobCreateInput[] = [];
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
