import { Prisma, PrismaClient } from "@prisma/client";
import { AshbyhqPostInterface } from "@src/template";

export class VoizeRepository {
  constructor(private prisma: PrismaClient) {}

  async getVoizeJobs(): Promise<
    Prisma.VoizeJobGetPayload<{
      include: {
        voizeLocation: true;
      };
    }>[]
  > {
    return this.prisma.voizeJob.findMany({
      include: {
        voizeLocation: true,
      },
    });
  }

  async createMany(data: AshbyhqPostInterface[]): Promise<boolean> {
    try {
      const jobData: Prisma.VoizeJobCreateInput[] = [];
      const locationData: {
        locationId: string;
        locationName: string;
        voizeJobId: string;
      }[] = [];

      data.forEach((job) => {
        jobData.push({
          jobId: job.jobId,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          href: job.href,
        });
        job.ashbyhqLocation.forEach((loc) => {
          locationData.push({
            locationId: loc.locationId,
            locationName: loc.locationName,
            voizeJobId: job.jobId,
          });
        });
      });

      await this.prisma.voizeJob.createMany({
        data: jobData,
      });

      const query = `
      SELECT j.id AS "voizeJobId",
       c."locationId",
       c."locationName"
      FROM "VoizeJob" j
      JOIN (
        VALUES ${locationData
          .map(
            (loc) =>
              `('${loc.voizeJobId}', '${loc.locationId}', '${loc.locationName}')`
          )
          .join(", ")}
      ) AS c("voizeJobId", "locationId", "locationName")
        ON j."jobId" = c."voizeJobId";
      `;
      if (locationData.length > 0) {
        const result: Prisma.VoizeLocationCreateManyInput[] =
          await this.prisma.$queryRawUnsafe(query);
        await this.prisma.voizeLocation.createMany({
          data: result,
        });
      }
      return true;
    } catch (error) {
      console.error("Error creating Voize jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.voizeJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Voize jobs:", error);
      return false;
    }
  }

  async compareData(data: AshbyhqPostInterface[]) {
    const deleteJobs: AshbyhqPostInterface[] = [];
    const updateJobs: AshbyhqPostInterface[] = [];
    const newJobs: AshbyhqPostInterface[] = [];
    const existingJobs = await this.getVoizeJobs();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.department === job.department &&
          existingJob.location === job.location &&
          existingJob.employmentType === job.employmentType &&
          existingJob.workplaceType === job.workplaceType &&
          existingJob.href === job.href &&
          existingJob.voizeLocation.length === job.ashbyhqLocation.length
        ) {
          for (const loc of job.ashbyhqLocation) {
            const locExists = existingJob.voizeLocation.find(
              (l) =>
                l.locationId === loc.locationId &&
                l.locationName === loc.locationName
            );
            if (!locExists) {
              updateJobs.push({ id: existingJob.id, ...job });
              break;
            }
          }
        } else {
          updateJobs.push({ id: existingJob.id, ...job });
        }
      } else {
        newJobs.push(job);
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.jobId === job.jobId);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          jobId: job.jobId,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          href: job.href,
          ashbyhqLocation: job.voizeLocation.map((loc) => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
          })),
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
