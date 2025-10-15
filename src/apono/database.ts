import { AponoJob, Prisma, PrismaClient } from "@prisma/client";

export class AponoJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AponoJob[]> {
    return this.prisma.aponoJob.findMany({});
  }

  async createMany(data: Prisma.AponoJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.aponoJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Apono jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.aponoJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Apono jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AponoJobCreateInput[]) {
    const deleteJobs: Prisma.AponoJobCreateInput[] = [];
    const updateJobs: Prisma.AponoJobCreateInput[] = [];
    const newJobs: Prisma.AponoJobCreateInput[] = [];
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
