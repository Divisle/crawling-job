import { CynerioJob, Prisma, PrismaClient } from "@prisma/client";

export class CynerioJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CynerioJob[]> {
    return this.prisma.cynerioJob.findMany({});
  }

  async createMany(data: Prisma.CynerioJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.cynerioJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Cynerio jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.cynerioJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Cynerio jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CynerioJobCreateInput[]) {
    const deleteJobs: Prisma.CynerioJobCreateInput[] = [];
    const updateJobs: Prisma.CynerioJobCreateInput[] = [];
    const newJobs: Prisma.CynerioJobCreateInput[] = [];
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
