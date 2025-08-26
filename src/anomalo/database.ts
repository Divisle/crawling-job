import type { AnomaloJob, Prisma, PrismaClient } from "@prisma/client";

export class AnomaloJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.AnomaloJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.anomaloJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating AnomaloJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<AnomaloJob[]> {
    return this.prisma.anomaloJob.findMany();
  }

  async findById(id: string): Promise<AnomaloJob | null> {
    try {
      const job = await this.prisma.anomaloJob.findUnique({ where: { id } });
      return job;
    } catch (error) {
      console.error("Error finding AnomaloJob by ID:", error);
      return null;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.anomaloJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting AnomaloJobs:", error);
      return false;
    }
  }

  async compareData(datas: Prisma.AnomaloJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const deleteJobs = oldJobData.filter((oldJob) =>
      datas.every((newJob) => newJob.href !== oldJob.href)
    );
    const newJobs = datas.filter((newJob) =>
      oldJobData.every((oldJob) => oldJob.href !== newJob.href)
    );
    const updateJobs = oldJobData.filter((oldJob) =>
      datas.some(
        (newJob) =>
          newJob.href === oldJob.href ||
          newJob.title !== oldJob.title ||
          newJob.location !== oldJob.location ||
          newJob.department !== oldJob.department
      )
    );

    return { deleteJobs, newJobs, updateJobs };
  }
}
