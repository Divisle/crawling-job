import { EnterpretJob, Prisma, PrismaClient } from "@prisma/client";

export class EnterpretJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EnterpretJob[]> {
    return this.prisma.enterpretJob.findMany({});
  }

  async createMany(data: Prisma.EnterpretJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.enterpretJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Enterpret jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.enterpretJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Enterpret jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EnterpretJobCreateInput[]) {
    const deleteJobs: Prisma.EnterpretJobCreateInput[] = [];
    const updateJobs: Prisma.EnterpretJobCreateInput[] = [];
    const newJobs: Prisma.EnterpretJobCreateInput[] = [];
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
