import { HaiiloJob, Prisma, PrismaClient } from "@prisma/client";

export class HaiiloRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<HaiiloJob[]> {
    return this.prisma.haiiloJob.findMany({});
  }

  async createMany(data: Prisma.HaiiloJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.haiiloJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Haiilo jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.haiiloJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Haiilo jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.HaiiloJobCreateInput[]) {
    const deleteJobs: Prisma.HaiiloJobCreateInput[] = [];
    const updateJobs: Prisma.HaiiloJobCreateInput[] = [];
    const newJobs: Prisma.HaiiloJobCreateInput[] = [];
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
