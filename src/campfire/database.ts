import { CampfireJob, Prisma, PrismaClient } from "@prisma/client";

export class CampfireJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CampfireJob[]> {
    return this.prisma.campfireJob.findMany({});
  }

  async createMany(data: Prisma.CampfireJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.campfireJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Campfire jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.campfireJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Campfire jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CampfireJobCreateInput[]) {
    const deleteJobs: Prisma.CampfireJobCreateInput[] = [];
    const updateJobs: Prisma.CampfireJobCreateInput[] = [];
    const newJobs: Prisma.CampfireJobCreateInput[] = [];
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
