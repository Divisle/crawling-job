import { KernelJob, Prisma, PrismaClient } from "@prisma/client";

export class KernelJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<KernelJob[]> {
    return this.prisma.kernelJob.findMany({});
  }

  async createMany(data: Prisma.KernelJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.kernelJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Kernel jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.kernelJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Kernel jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.KernelJobCreateInput[]) {
    const deleteJobs: Prisma.KernelJobCreateInput[] = [];
    const updateJobs: Prisma.KernelJobCreateInput[] = [];
    const newJobs: Prisma.KernelJobCreateInput[] = [];
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
