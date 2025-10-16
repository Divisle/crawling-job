import { TalosJob, Prisma, PrismaClient } from "@prisma/client";

export class TalosJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TalosJob[]> {
    return this.prisma.talosJob.findMany({});
  }

  async createMany(data: Prisma.TalosJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.talosJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Talos jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.talosJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Talos jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TalosJobCreateInput[]) {
    const deleteJobs: Prisma.TalosJobCreateInput[] = [];
    const updateJobs: Prisma.TalosJobCreateInput[] = [];
    const newJobs: Prisma.TalosJobCreateInput[] = [];
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
