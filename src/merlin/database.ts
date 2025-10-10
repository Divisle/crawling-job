import { MerlinJob, Prisma, PrismaClient } from "@prisma/client";

export class MerlinJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MerlinJob[]> {
    return this.prisma.merlinJob.findMany({});
  }

  async createMany(data: Prisma.MerlinJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.merlinJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Merlin jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.merlinJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Merlin jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MerlinJobCreateInput[]) {
    const deleteJobs: Prisma.MerlinJobCreateInput[] = [];
    const updateJobs: Prisma.MerlinJobCreateInput[] = [];
    const newJobs: Prisma.MerlinJobCreateInput[] = [];
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
