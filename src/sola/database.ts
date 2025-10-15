import { SolaJob, Prisma, PrismaClient } from "@prisma/client";

export class SolaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SolaJob[]> {
    return this.prisma.solaJob.findMany({});
  }

  async createMany(data: Prisma.SolaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.solaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Sola jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.solaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Sola jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SolaJobCreateInput[]) {
    const deleteJobs: Prisma.SolaJobCreateInput[] = [];
    const updateJobs: Prisma.SolaJobCreateInput[] = [];
    const newJobs: Prisma.SolaJobCreateInput[] = [];
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
