import { Prisma, PrismaClient } from "@prisma/client";
import { FarSightJobInterface } from "@src/template/farsight";

export class FarSightRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllJobs(): Promise<
    Prisma.FarSightJobGetPayload<{
      include: {
        locations: true;
      };
    }>[]
  > {
    return this.prisma.farSightJob.findMany({
      include: {
        locations: true,
      },
    });
  }

  async createMany(data: FarSightJobInterface[]): Promise<boolean> {
    try {
      const jobData: Prisma.FarSightJobCreateInput[] = [];
      const locationData: {
        jobId: string;
        locationId: string;
        locationType: string;
        locationName: string;
      }[] = [];
      data.forEach((job) => {
        jobData.push({
          id: job.id,
          jobId: job.jobId,
          title: job.title,
          href: job.href,
        });
        job.locations.forEach((loc) => {
          locationData.push({
            jobId: job.jobId,
            locationId: loc.locationId,
            locationType: loc.locationType,
            locationName: loc.locationName,
          });
        });
      });
      await this.prisma.farSightJob.createMany({
        data: jobData,
      });
      if (locationData.length > 0) {
        const query = `
          SELECT j.id AS "farSightJobId",
          c."locationId",
          c."locationName",
          c."locationType"
          FROM "FarSightJob" j
          JOIN (
            VALUES ${locationData
              .map(
                (loc) =>
                  `('${loc.jobId}', '${loc.locationId}', '${loc.locationName}', '${loc.locationType}')`
              )
              .join(", ")}
          ) AS c("farSightJobId", "locationId", "locationName", "locationType")
            ON j."jobId" = c."farSightJobId";
      `;
        const result: Prisma.FarSightLocationCreateManyInput[] =
          await this.prisma.$queryRawUnsafe(query);
        await this.prisma.farSightLocation.createMany({
          data: result,
        });
      }
      return true;
    } catch (error) {
      console.error("Error creating FarSight jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.farSightJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting FarSight jobs:", error);
      return false;
    }
  }

  async compareData(data: FarSightJobInterface[]): Promise<{
    newJobs: FarSightJobInterface[];
    updateJobs: FarSightJobInterface[];
    deleteJobs: FarSightJobInterface[];
  }> {
    const existingJobs = await this.getAllJobs();
    const newJobs: FarSightJobInterface[] = [];
    const updateJobs: FarSightJobInterface[] = [];
    const deleteJobs: FarSightJobInterface[] = [];

    existingJobs.forEach((existingJob) => {
      if (!data.some((job) => job.jobId === existingJob.jobId)) {
        deleteJobs.push(existingJob);
      }
    });
    data.forEach((job) => {
      const existingJob = existingJobs.find((e) => e.jobId === job.jobId);
      if (!existingJob) {
        newJobs.push(job);
      } else {
        if (existingJob.title !== job.title || existingJob.href !== job.href) {
          updateJobs.push({
            id: existingJob.id,
            ...job,
          });
        } else {
          if (existingJob.locations.length !== job.locations.length) {
            updateJobs.push({
              id: existingJob.id,
              ...job,
            });
          } else {
            for (const loc of job.locations) {
              const existingLoc = existingJob.locations.find(
                (e) =>
                  e.locationId === loc.locationId &&
                  e.locationName === loc.locationName &&
                  e.locationType === loc.locationType
              );
              if (!existingLoc) {
                updateJobs.push({
                  id: existingJob.id,
                  ...job,
                });
                break;
              }
            }
          }
        }
      }
    });

    return {
      newJobs,
      updateJobs,
      deleteJobs,
    };
  }
}
