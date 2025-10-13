import { PushSecurityJob, Prisma, PrismaClient } from "@prisma/client";

export class PushSecurityJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PushSecurityJob[]> {
    return this.prisma.pushSecurityJob.findMany({});
  }

  async createMany(
    data: Prisma.PushSecurityJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.pushSecurityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Push Security jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.pushSecurityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Push Security jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PushSecurityJobCreateInput[]) {
    const deleteJobs: Prisma.PushSecurityJobCreateInput[] = [];
    const updateJobs: Prisma.PushSecurityJobCreateInput[] = [];
    const newJobs: Prisma.PushSecurityJobCreateInput[] = [];
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
