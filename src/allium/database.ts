import { AlliumJob, Prisma, PrismaClient } from "@prisma/client";

export class AlliumJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<AlliumJob[]> {
    return this.prisma.alliumJob.findMany({});
  }

  async createMany(data: Prisma.AlliumJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.alliumJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Allium jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.alliumJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Allium jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.AlliumJobCreateInput[]) {
    const deleteJobs: Prisma.AlliumJobCreateInput[] = [];
    const updateJobs: Prisma.AlliumJobCreateInput[] = [];
    const newJobs: Prisma.AlliumJobCreateInput[] = [];
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
