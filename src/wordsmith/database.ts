import { WordsmithJob, Prisma, PrismaClient } from "@prisma/client";

export class WordsmithJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WordsmithJob[]> {
    return this.prisma.wordsmithJob.findMany({});
  }

  async createMany(data: Prisma.WordsmithJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.wordsmithJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Wordsmith jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.wordsmithJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Wordsmith jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WordsmithJobCreateInput[]) {
    const deleteJobs: Prisma.WordsmithJobCreateInput[] = [];
    const updateJobs: Prisma.WordsmithJobCreateInput[] = [];
    const newJobs: Prisma.WordsmithJobCreateInput[] = [];
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
