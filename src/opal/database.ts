import { OpalJob, Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface } from "@src/template";

export class OpalRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OpalJob[]> {
    return this.prisma.opalJob.findMany({});
  }

  async createMany(data: Prisma.OpalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.opalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Opal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.opalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Opal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OpalJobCreateInput[]) {
    const deleteJobs: Prisma.OpalJobCreateInput[] = [];
    const updateJobs: Prisma.OpalJobCreateInput[] = [];
    const newJobs: Prisma.OpalJobCreateInput[] = [];
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
