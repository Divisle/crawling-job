import { VClusterJob, Prisma, PrismaClient } from "@prisma/client";

export class VClusterJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<VClusterJob[]> {
    return this.prisma.vClusterJob.findMany({});
  }

  async createMany(data: Prisma.VClusterJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.vClusterJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating VCluster jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.vClusterJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting VCluster jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.VClusterJobCreateInput[]) {
    const deleteJobs: Prisma.VClusterJobCreateInput[] = [];
    const updateJobs: Prisma.VClusterJobCreateInput[] = [];
    const newJobs: Prisma.VClusterJobCreateInput[] = [];
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
