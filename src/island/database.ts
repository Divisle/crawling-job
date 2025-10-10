import { IslandJob, Prisma, PrismaClient } from "@prisma/client";

export class IslandJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<IslandJob[]> {
    return this.prisma.islandJob.findMany({});
  }

  async createMany(data: Prisma.IslandJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.islandJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Island jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.islandJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Island jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.IslandJobCreateInput[]) {
    const deleteJobs: Prisma.IslandJobCreateInput[] = [];
    const updateJobs: Prisma.IslandJobCreateInput[] = [];
    const newJobs: Prisma.IslandJobCreateInput[] = [];
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
