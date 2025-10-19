import { PayflowsJob, Prisma, PrismaClient } from "@prisma/client";

export class PayflowsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PayflowsJob[]> {
    return this.prisma.payflowsJob.findMany({});
  }

  async createMany(data: Prisma.PayflowsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.payflowsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Payflows jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.payflowsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Payflows jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PayflowsJobCreateInput[]) {
    const deleteJobs: Prisma.PayflowsJobCreateInput[] = [];
    const updateJobs: Prisma.PayflowsJobCreateInput[] = [];
    const newJobs: Prisma.PayflowsJobCreateInput[] = [];
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
