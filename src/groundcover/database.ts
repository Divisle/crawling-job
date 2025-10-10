import { GroundcoverJob, Prisma, PrismaClient } from "@prisma/client";

export class GroundcoverRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<GroundcoverJob[]> {
    return this.prisma.groundcoverJob.findMany({});
  }

  async createMany(data: Prisma.GroundcoverJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.groundcoverJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Groundcover jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.groundcoverJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Groundcover jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.GroundcoverJobCreateInput[]) {
    const deleteJobs: Prisma.GroundcoverJobCreateInput[] = [];
    const updateJobs: Prisma.GroundcoverJobCreateInput[] = [];
    const newJobs: Prisma.GroundcoverJobCreateInput[] = [];
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
