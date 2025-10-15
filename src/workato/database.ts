import { WorkatoJob, Prisma, PrismaClient } from "@prisma/client";

export class WorkatoJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WorkatoJob[]> {
    return this.prisma.workatoJob.findMany({});
  }

  async createMany(data: Prisma.WorkatoJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.workatoJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Workato jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.workatoJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Workato jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WorkatoJobCreateInput[]) {
    const deleteJobs: Prisma.WorkatoJobCreateInput[] = [];
    const updateJobs: Prisma.WorkatoJobCreateInput[] = [];
    const newJobs: Prisma.WorkatoJobCreateInput[] = [];
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
