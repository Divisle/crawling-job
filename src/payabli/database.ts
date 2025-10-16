import { PayabliJob, Prisma, PrismaClient } from "@prisma/client";

export class PayabliJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PayabliJob[]> {
    return this.prisma.payabliJob.findMany({});
  }

  async createMany(data: Prisma.PayabliJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.payabliJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Payabli jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.payabliJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Payabli jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PayabliJobCreateInput[]) {
    const deleteJobs: Prisma.PayabliJobCreateInput[] = [];
    const updateJobs: Prisma.PayabliJobCreateInput[] = [];
    const newJobs: Prisma.PayabliJobCreateInput[] = [];
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
