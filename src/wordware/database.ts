import { WordwareJob, Prisma, PrismaClient } from "@prisma/client";

export class WordwareJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WordwareJob[]> {
    return this.prisma.wordwareJob.findMany({});
  }

  async createMany(data: Prisma.WordwareJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.wordwareJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Wordware jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.wordwareJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Wordware jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WordwareJobCreateInput[]) {
    const deleteJobs: Prisma.WordwareJobCreateInput[] = [];
    const updateJobs: Prisma.WordwareJobCreateInput[] = [];
    const newJobs: Prisma.WordwareJobCreateInput[] = [];
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
