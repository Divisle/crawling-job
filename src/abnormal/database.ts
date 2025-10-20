import { AbnormalJob, Prisma, PrismaClient } from "@prisma/client";

export class AbnormalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AbnormalJob[]> {
    return this.prisma.abnormalJob.findMany({});
  }

  async createMany(data: Prisma.AbnormalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.abnormalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Abnormal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.abnormalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Abnormal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AbnormalJobCreateInput[]) {
    const deleteJobs: Prisma.AbnormalJobCreateInput[] = [];
    const updateJobs: Prisma.AbnormalJobCreateInput[] = [];
    const newJobs: Prisma.AbnormalJobCreateInput[] = [];
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
