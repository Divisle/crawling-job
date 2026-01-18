import { RedaccessJob, Prisma, PrismaClient } from "@prisma/client";

export class RedaccessJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RedaccessJob[]> {
    return this.prisma.redaccessJob.findMany({});
  }

  async createMany(data: Prisma.RedaccessJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.redaccessJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Redaccess jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.redaccessJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Redaccess jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RedaccessJobCreateInput[]) {
    const deleteJobs: Prisma.RedaccessJobCreateInput[] = [];
    const updateJobs: Prisma.RedaccessJobCreateInput[] = [];
    const newJobs: Prisma.RedaccessJobCreateInput[] = [];
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
