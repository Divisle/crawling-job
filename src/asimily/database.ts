import { AsimilyJob, Prisma, PrismaClient } from "@prisma/client";

export class AsimilyJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AsimilyJob[]> {
    return this.prisma.asimilyJob.findMany({});
  }

  async createMany(data: Prisma.AsimilyJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.asimilyJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Asimily jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.asimilyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Asimily jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AsimilyJobCreateInput[]) {
    const deleteJobs: Prisma.AsimilyJobCreateInput[] = [];
    const updateJobs: Prisma.AsimilyJobCreateInput[] = [];
    const newJobs: Prisma.AsimilyJobCreateInput[] = [];
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
