import { Lepton, Prisma, PrismaClient } from "@prisma/client";

export class LeptonJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<Lepton[]> {
    return await this.prisma.lepton.findMany();
  }

  async createMany(data: Prisma.LeptonCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.lepton.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating leptons:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.lepton.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting leptons:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LeptonCreateInput[]): Promise<{
    newJobs: Prisma.LeptonCreateInput[];
    updateJobs: Prisma.LeptonCreateInput[];
    deleteJobs: Prisma.LeptonCreateInput[];
  }> {
    const newJobs: Prisma.LeptonCreateInput[] = [];
    const updateJobs: Prisma.LeptonCreateInput[] = [];
    const deleteJobs: Prisma.LeptonCreateInput[] = [];
    const existingJobs = await this.getAll();
    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (!existingJob) {
        newJobs.push(job);
      } else if (
        existingJob.title !== job.title ||
        existingJob.location !== job.location
      ) {
        updateJobs.push({
          ...job,
          id: existingJob.id,
        });
      }
    });
    existingJobs.forEach((job) => {
      const found = data.find((j) => j.href === job.href);
      if (!found) {
        deleteJobs.push(job);
      }
    });
    return {
      newJobs,
      updateJobs,
      deleteJobs,
    };
  }
}
