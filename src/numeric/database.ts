import { NumericJob, Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface } from "@src/template";

export class NumericRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<NumericJob[]> {
    return this.prisma.numericJob.findMany({});
  }

  async createMany(data: Prisma.NumericJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Numeric jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Numeric jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.NumericJobCreateInput[]) {
    const deleteJobs: Prisma.NumericJobCreateInput[] = [];
    const updateJobs: Prisma.NumericJobCreateInput[] = [];
    const newJobs: Prisma.NumericJobCreateInput[] = [];
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
