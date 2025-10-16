import { DeepgramJob, Prisma, PrismaClient } from "@prisma/client";

export class DeepgramJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<DeepgramJob[]> {
    return this.prisma.deepgramJob.findMany({});
  }

  async createMany(data: Prisma.DeepgramJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.deepgramJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Deepgram jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.deepgramJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Deepgram jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.DeepgramJobCreateInput[]) {
    const deleteJobs: Prisma.DeepgramJobCreateInput[] = [];
    const updateJobs: Prisma.DeepgramJobCreateInput[] = [];
    const newJobs: Prisma.DeepgramJobCreateInput[] = [];
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
