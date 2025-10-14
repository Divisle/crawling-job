import { PactumJob, Prisma, PrismaClient } from "@prisma/client";

export class PactumJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PactumJob[]> {
    return this.prisma.pactumJob.findMany({});
  }

  async createMany(data: Prisma.PactumJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.pactumJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Pactum jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.pactumJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Pactum jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PactumJobCreateInput[]) {
    const deleteJobs: Prisma.PactumJobCreateInput[] = [];
    const updateJobs: Prisma.PactumJobCreateInput[] = [];
    const newJobs: Prisma.PactumJobCreateInput[] = [];
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
