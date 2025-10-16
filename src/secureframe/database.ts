import { SecureframeJob, Prisma, PrismaClient } from "@prisma/client";

export class SecureframeJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SecureframeJob[]> {
    return this.prisma.secureframeJob.findMany({});
  }

  async createMany(data: Prisma.SecureframeJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.secureframeJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Secureframe jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.secureframeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Secureframe jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SecureframeJobCreateInput[]) {
    const deleteJobs: Prisma.SecureframeJobCreateInput[] = [];
    const updateJobs: Prisma.SecureframeJobCreateInput[] = [];
    const newJobs: Prisma.SecureframeJobCreateInput[] = [];
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
