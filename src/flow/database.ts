import { FlowJob, Prisma, PrismaClient } from "@prisma/client";

export class FlowJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FlowJob[]> {
    return this.prisma.flowJob.findMany({});
  }

  async createMany(data: Prisma.FlowJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.flowJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Flow jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.flowJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Flow jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FlowJobCreateInput[]) {
    const deleteJobs: Prisma.FlowJobCreateInput[] = [];
    const updateJobs: Prisma.FlowJobCreateInput[] = [];
    const newJobs: Prisma.FlowJobCreateInput[] = [];
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
