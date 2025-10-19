import { LlamaindexJob, Prisma, PrismaClient } from "@prisma/client";

export class LlamaindexJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<LlamaindexJob[]> {
    return this.prisma.llamaindexJob.findMany({});
  }

  async createMany(data: Prisma.LlamaindexJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.llamaindexJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Llamaindex jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.llamaindexJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Llamaindex jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LlamaindexJobCreateInput[]) {
    const deleteJobs: Prisma.LlamaindexJobCreateInput[] = [];
    const updateJobs: Prisma.LlamaindexJobCreateInput[] = [];
    const newJobs: Prisma.LlamaindexJobCreateInput[] = [];
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
