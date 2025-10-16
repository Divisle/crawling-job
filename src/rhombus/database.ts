import { RhombusJob, Prisma, PrismaClient } from "@prisma/client";

export class RhombusJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<RhombusJob[]> {
    return this.prisma.rhombusJob.findMany({});
  }

  async createMany(data: Prisma.RhombusJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.rhombusJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Rhombus jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.rhombusJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Rhombus jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.RhombusJobCreateInput[]) {
    const deleteJobs: Prisma.RhombusJobCreateInput[] = [];
    const updateJobs: Prisma.RhombusJobCreateInput[] = [];
    const newJobs: Prisma.RhombusJobCreateInput[] = [];
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
