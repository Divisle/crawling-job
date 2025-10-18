import { SynthflowJob, Prisma, PrismaClient } from "@prisma/client";

export class SynthflowJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SynthflowJob[]> {
    return this.prisma.synthflowJob.findMany({});
  }

  async createMany(data: Prisma.SynthflowJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.synthflowJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Synthflow jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.synthflowJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Synthflow jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SynthflowJobCreateInput[]) {
    const deleteJobs: Prisma.SynthflowJobCreateInput[] = [];
    const updateJobs: Prisma.SynthflowJobCreateInput[] = [];
    const newJobs: Prisma.SynthflowJobCreateInput[] = [];
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
