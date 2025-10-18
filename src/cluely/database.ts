import { CluelyJob, Prisma, PrismaClient } from "@prisma/client";

export class CluelyJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CluelyJob[]> {
    return this.prisma.cluelyJob.findMany({});
  }

  async createMany(data: Prisma.CluelyJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cluelyJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cluely jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cluelyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cluely jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CluelyJobCreateInput[]) {
    const deleteJobs: Prisma.CluelyJobCreateInput[] = [];
    const updateJobs: Prisma.CluelyJobCreateInput[] = [];
    const newJobs: Prisma.CluelyJobCreateInput[] = [];
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
