import { JuliusJob, Prisma, PrismaClient } from "@prisma/client";

export class JuliusJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<JuliusJob[]> {
    return this.prisma.juliusJob.findMany({});
  }

  async createMany(data: Prisma.JuliusJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.juliusJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Julius jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.juliusJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Julius jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.JuliusJobCreateInput[]) {
    const deleteJobs: Prisma.JuliusJobCreateInput[] = [];
    const updateJobs: Prisma.JuliusJobCreateInput[] = [];
    const newJobs: Prisma.JuliusJobCreateInput[] = [];
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
