import { PigmentJob, Prisma, PrismaClient } from "@prisma/client";

export class PigmentJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PigmentJob[]> {
    return this.prisma.pigmentJob.findMany({});
  }

  async createMany(data: Prisma.PigmentJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.pigmentJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Pigment jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.pigmentJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Pigment jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PigmentJobCreateInput[]) {
    const deleteJobs: Prisma.PigmentJobCreateInput[] = [];
    const updateJobs: Prisma.PigmentJobCreateInput[] = [];
    const newJobs: Prisma.PigmentJobCreateInput[] = [];
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
