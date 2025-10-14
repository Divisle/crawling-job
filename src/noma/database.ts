import { NomaJob, Prisma, PrismaClient } from "@prisma/client";

export class NomaJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<NomaJob[]> {
    return this.prisma.nomaJob.findMany({});
  }

  async createMany(data: Prisma.NomaJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.nomaJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Noma jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.nomaJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Noma jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.NomaJobCreateInput[]) {
    const deleteJobs: Prisma.NomaJobCreateInput[] = [];
    const updateJobs: Prisma.NomaJobCreateInput[] = [];
    const newJobs: Prisma.NomaJobCreateInput[] = [];
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
