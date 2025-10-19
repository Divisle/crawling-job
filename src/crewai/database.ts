import { CrewaiJob, Prisma, PrismaClient } from "@prisma/client";

export class CrewaiJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CrewaiJob[]> {
    return this.prisma.crewaiJob.findMany({});
  }

  async createMany(data: Prisma.CrewaiJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.crewaiJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Crewai jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.crewaiJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Crewai jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CrewaiJobCreateInput[]) {
    const deleteJobs: Prisma.CrewaiJobCreateInput[] = [];
    const updateJobs: Prisma.CrewaiJobCreateInput[] = [];
    const newJobs: Prisma.CrewaiJobCreateInput[] = [];
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
