import { PulseJob, Prisma, PrismaClient } from "@prisma/client";

export class PulseJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PulseJob[]> {
    return this.prisma.pulseJob.findMany({});
  }

  async createMany(data: Prisma.PulseJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.pulseJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Pulse jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.pulseJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Pulse jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PulseJobCreateInput[]) {
    const deleteJobs: Prisma.PulseJobCreateInput[] = [];
    const updateJobs: Prisma.PulseJobCreateInput[] = [];
    const newJobs: Prisma.PulseJobCreateInput[] = [];
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
