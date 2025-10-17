import { TatumJob, Prisma, PrismaClient } from "@prisma/client";

export class TatumJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TatumJob[]> {
    return this.prisma.tatumJob.findMany({});
  }

  async createMany(data: Prisma.TatumJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.tatumJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Tatum jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.tatumJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Tatum jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TatumJobCreateInput[]) {
    const deleteJobs: Prisma.TatumJobCreateInput[] = [];
    const updateJobs: Prisma.TatumJobCreateInput[] = [];
    const newJobs: Prisma.TatumJobCreateInput[] = [];
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
