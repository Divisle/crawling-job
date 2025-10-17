import { TrustmiJob, Prisma, PrismaClient } from "@prisma/client";

export class TrustmiJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TrustmiJob[]> {
    return this.prisma.trustmiJob.findMany({});
  }

  async createMany(data: Prisma.TrustmiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.trustmiJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Trustmi jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.trustmiJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Trustmi jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TrustmiJobCreateInput[]) {
    const deleteJobs: Prisma.TrustmiJobCreateInput[] = [];
    const updateJobs: Prisma.TrustmiJobCreateInput[] = [];
    const newJobs: Prisma.TrustmiJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find(
        (j) => j.href === job.href && j.location === job.location
      );
      if (existingJob) {
        if (existingJob.title === job.title) {
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
      const locExists = data.find(
        (j) => j.href === job.href && j.location === job.location
      );
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
