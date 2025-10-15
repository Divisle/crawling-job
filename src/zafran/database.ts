import { ZafranJob, Prisma, PrismaClient } from "@prisma/client";

export class ZafranJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ZafranJob[]> {
    return this.prisma.zafranJob.findMany({});
  }

  async createMany(data: Prisma.ZafranJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.zafranJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Zafran jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zafranJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Zafran jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZafranJobCreateInput[]) {
    const deleteJobs: Prisma.ZafranJobCreateInput[] = [];
    const updateJobs: Prisma.ZafranJobCreateInput[] = [];
    const newJobs: Prisma.ZafranJobCreateInput[] = [];
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
