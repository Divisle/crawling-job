import { KognitosJob, Prisma, PrismaClient } from "@prisma/client";

export class KognitosJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<KognitosJob[]> {
    return this.prisma.kognitosJob.findMany({});
  }

  async createMany(data: Prisma.KognitosJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.kognitosJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Kognitos jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.kognitosJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Kognitos jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.KognitosJobCreateInput[]) {
    const deleteJobs: Prisma.KognitosJobCreateInput[] = [];
    const updateJobs: Prisma.KognitosJobCreateInput[] = [];
    const newJobs: Prisma.KognitosJobCreateInput[] = [];
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
