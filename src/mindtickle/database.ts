import { MindtickleJob, Prisma, PrismaClient } from "@prisma/client";

export class MindtickleJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<MindtickleJob[]> {
    return this.prisma.mindtickleJob.findMany({});
  }

  async createMany(data: Prisma.MindtickleJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.mindtickleJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Mindtickle jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.mindtickleJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Mindtickle jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.MindtickleJobCreateInput[]) {
    const deleteJobs: Prisma.MindtickleJobCreateInput[] = [];
    const updateJobs: Prisma.MindtickleJobCreateInput[] = [];
    const newJobs: Prisma.MindtickleJobCreateInput[] = [];
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
