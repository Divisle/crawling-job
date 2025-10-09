import { CognitionJob, Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface } from "@src/template";

export class CognitionRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CognitionJob[]> {
    return this.prisma.cognitionJob.findMany({});
  }

  async createMany(data: Prisma.CognitionJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cognitionJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cognition jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cognitionJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cognition jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CognitionJobCreateInput[]) {
    const deleteJobs: Prisma.CognitionJobCreateInput[] = [];
    const updateJobs: Prisma.CognitionJobCreateInput[] = [];
    const newJobs: Prisma.CognitionJobCreateInput[] = [];
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
