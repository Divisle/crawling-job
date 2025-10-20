import { BraintrustJob, Prisma, PrismaClient } from "@prisma/client";

export class BraintrustRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<BraintrustJob[]> {
    return this.prisma.braintrustJob.findMany({});
  }

  async createMany(data: Prisma.BraintrustJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.braintrustJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Braintrust jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.braintrustJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Braintrust jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.BraintrustJobCreateInput[]) {
    const deleteJobs: Prisma.BraintrustJobCreateInput[] = [];
    const updateJobs: Prisma.BraintrustJobCreateInput[] = [];
    const newJobs: Prisma.BraintrustJobCreateInput[] = [];
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
