import { AssorthealthJob, Prisma, PrismaClient } from "@prisma/client";

export class AssorthealthJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AssorthealthJob[]> {
    return this.prisma.assorthealthJob.findMany({});
  }

  async createMany(
    data: Prisma.AssorthealthJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.assorthealthJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Assorthealth jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.assorthealthJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Assorthealth jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AssorthealthJobCreateInput[]) {
    const deleteJobs: Prisma.AssorthealthJobCreateInput[] = [];
    const updateJobs: Prisma.AssorthealthJobCreateInput[] = [];
    const newJobs: Prisma.AssorthealthJobCreateInput[] = [];
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
