import { ElevenlabsJob, Prisma, PrismaClient } from "@prisma/client";

export class ElevenlabsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ElevenlabsJob[]> {
    return this.prisma.elevenlabsJob.findMany({});
  }

  async createMany(data: Prisma.ElevenlabsJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.elevenlabsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Elevenlabs jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.elevenlabsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Elevenlabs jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ElevenlabsJobCreateInput[]) {
    const deleteJobs: Prisma.ElevenlabsJobCreateInput[] = [];
    const updateJobs: Prisma.ElevenlabsJobCreateInput[] = [];
    const newJobs: Prisma.ElevenlabsJobCreateInput[] = [];
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
