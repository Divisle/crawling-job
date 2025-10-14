import { PlayzeroJob, Prisma, PrismaClient } from "@prisma/client";

export class PlayzeroJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PlayzeroJob[]> {
    return this.prisma.playzeroJob.findMany({});
  }

  async createMany(data: Prisma.PlayzeroJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.playzeroJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Playzero jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.playzeroJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Playzero jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PlayzeroJobCreateInput[]) {
    const deleteJobs: Prisma.PlayzeroJobCreateInput[] = [];
    const updateJobs: Prisma.PlayzeroJobCreateInput[] = [];
    const newJobs: Prisma.PlayzeroJobCreateInput[] = [];
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
