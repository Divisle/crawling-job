import { ZeroNetworksJob, Prisma, PrismaClient } from "@prisma/client";

export class ZeroNetworksJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ZeroNetworksJob[]> {
    return this.prisma.zeroNetworksJob.findMany({});
  }

  async createMany(
    data: Prisma.ZeroNetworksJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.zeroNetworksJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating ZeroNetworks jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.zeroNetworksJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ZeroNetworks jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ZeroNetworksJobCreateInput[]) {
    const deleteJobs: Prisma.ZeroNetworksJobCreateInput[] = [];
    const updateJobs: Prisma.ZeroNetworksJobCreateInput[] = [];
    const newJobs: Prisma.ZeroNetworksJobCreateInput[] = [];
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
