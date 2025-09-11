import BaseRepository from "../BaseRepository";
import {
  Tutor,
  ListingTutor,
  UpdateProfileData,
} from "../../interfaces/tutorInterface/tutorInterface";
import { ITutorRepository } from "../../interfaces/tutor/ITutorRepository";
import { TutorDocuments } from "../../models/TutorDocs";
import TutorModel from "../../models/Tutors";
import { TutorMapper } from "../../mappers/tutor/TutorMapper";
import {
  TutorServiceDTO,
  VerificationDocsServiceDTO,
  CreateVerificationDocsDTO,
  UpdateVerificationDocsDTO,
  ListedTutorDTO,
} from "../../dto/tutor/TutorDTO";

export class TutorRepository
  extends BaseRepository<Tutor>
  implements ITutorRepository
{
  private tutorDocsModel: typeof TutorDocuments;

  constructor() {
    super(TutorModel);
    this.tutorDocsModel = TutorDocuments;
  }

  async findById(id: string): Promise<Tutor | null> {
    try {
      return await this.findOne({ _id: id });
    } catch (error) {
      console.error("Error finding tutor by ID:", error);
      throw error;
    }
  }

  async findTutorByEmailOrPhone(
    email?: string,
    phone?: string
  ): Promise<TutorServiceDTO | null> {
    try {
      const query: any = {};

      if (email && phone) {
        query.$or = [{ email }, { phone }];
      } else if (email) {
        query.email = email;
      } else if (phone) {
        query.phone = phone;
      } else {
        return null;
      }

      const tutor = await this.findOne(query);
      return tutor ? TutorMapper.mapTutorToServiceDTO(tutor) : null;
    } catch (error) {
      console.error("Error finding tutor by email or phone:", error);
      throw error;
    }
  }

  async findByPhoneExcludingId(
    phone: string,
    excludeId: string
  ): Promise<TutorServiceDTO | null> {
    try {
      const tutor = await this.findOne({ phone, _id: { $ne: excludeId } });
      return tutor ? TutorMapper.mapTutorToServiceDTO(tutor) : null;
    } catch (error) {
      console.error("Error finding tutor by phone excluding ID:", error);
      throw error;
    }
  }

  async findByEmailExcludingId(
    email: string,
    excludeId: string
  ): Promise<TutorServiceDTO | null> {
    try {
      const tutor = await this.findOne({ email, _id: { $ne: excludeId } });
      return tutor ? TutorMapper.mapTutorToServiceDTO(tutor) : null;
    } catch (error) {
      console.error("Error finding tutor by email excluding ID:", error);
      throw error;
    }
  }

  async updateProfile(
    tutorId: string,
    updateData: UpdateProfileData
  ): Promise<Tutor | null> {
    try {
      const updateObject: any = {};

      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateProfileData] !== undefined) {
          if (key === "DOB" && updateData.DOB) {
            updateObject.DOB = new Date(updateData.DOB);
          } else if (key === "name" && updateData.name) {
            updateObject.name = updateData.name.trim();
          } else if (key === "designation" && updateData.designation) {
            updateObject.designation = updateData.designation.trim();
          } else if (key === "about" && updateData.about) {
            updateObject.about = updateData.about.trim();
          } else if (key !== "cropData") {
            updateObject[key] = updateData[key as keyof UpdateProfileData];
          }
        }
      });

      return await this.update(tutorId, updateObject);
    } catch (error) {
      console.error("Error updating tutor profile:", error);
      throw error;
    }
  }

  async findVerificationDocsByTutorId(
    tutorId: string
  ): Promise<VerificationDocsServiceDTO | null> {
    try {
      const docs = await this.tutorDocsModel.findOne({ tutorId }).exec();
      return docs ? TutorMapper.mapVerificationDocsToServiceDTO(docs) : null;
    } catch (error) {
      console.error("Error finding verification docs by tutor ID:", error);
      throw error;
    }
  }

  async createVerificationDocs(
    documentData: CreateVerificationDocsDTO
  ): Promise<VerificationDocsServiceDTO> {
    try {
      const verificationDocs = new this.tutorDocsModel(documentData);
      const savedDocs = await verificationDocs.save();
      return TutorMapper.mapVerificationDocsToServiceDTO(savedDocs);
    } catch (error) {
      console.error("Error creating verification documents:", error);
      throw error;
    }
  }

  async updateVerificationDocs(
    docId: string,
    updateData: UpdateVerificationDocsDTO
  ): Promise<VerificationDocsServiceDTO | null> {
    try {
      const updatedDocs = await this.tutorDocsModel
        .findByIdAndUpdate(docId, updateData, {
          new: true,
          runValidators: true,
        })
        .exec();

      return updatedDocs
        ? TutorMapper.mapVerificationDocsToServiceDTO(updatedDocs)
        : null;
    } catch (error) {
      console.error("Error updating verification documents:", error);
      throw error;
    }
  }

  async findVerificationDocsByStatus(
    status: "pending" | "approved" | "rejected"
  ): Promise<VerificationDocsServiceDTO[]> {
    try {
      const docs = await this.tutorDocsModel
        .find({ verificationStatus: status })
        .exec();
      return docs.map((doc) =>
        TutorMapper.mapVerificationDocsToServiceDTO(doc)
      );
    } catch (error) {
      console.error("Error finding verification docs by status:", error);
      throw error;
    }
  }

  async findVerificationDocsWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<VerificationDocsServiceDTO[]> {
    try {
      const docs = await this.tutorDocsModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ submittedAt: -1 })
        .exec();
      return docs.map((doc) =>
        TutorMapper.mapVerificationDocsToServiceDTO(doc)
      );
    } catch (error) {
      console.error("Error finding verification docs with pagination:", error);
      throw error;
    }
  }

  async countVerificationDocsByStatus(
    status: "pending" | "approved" | "rejected"
  ): Promise<number> {
    try {
      return await this.tutorDocsModel
        .countDocuments({ verificationStatus: status })
        .exec();
    } catch (error) {
      console.error("Error counting verification docs by status:", error);
      throw error;
    }
  }

  async updateVerificationStatus(
    docId: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string
  ): Promise<VerificationDocsServiceDTO | null> {
    try {
      const updateData: any = {
        verificationStatus: status,
        reviewedAt: new Date(),
      };

      if (status === "rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedDocs = await this.tutorDocsModel
        .findByIdAndUpdate(docId, updateData, {
          new: true,
          runValidators: true,
        })
        .exec();

      return updatedDocs
        ? TutorMapper.mapVerificationDocsToServiceDTO(updatedDocs)
        : null;
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
  }

  async findVerificationDocsWithTutorInfo(tutorId: string): Promise<any> {
    try {
      return await this.tutorDocsModel
        .findOne({ tutorId })
        .populate("tutorId", "name email phone")
        .exec();
    } catch (error) {
      console.error("Error finding verification docs with tutor info:", error);
      throw error;
    }
  }

  async findAllVerificationDocsWithTutorInfo(): Promise<any[]> {
    try {
      return await this.tutorDocsModel
        .find()
        .populate("tutorId", "name email phone")
        .sort({ submittedAt: -1 })
        .exec();
    } catch (error) {
      console.error(
        "Error finding all verification docs with tutor info:",
        error
      );
      throw error;
    }
  }

  async findTutorsWithVerificationStatus(
    verificationStatus?: "pending" | "approved" | "rejected"
  ): Promise<any[]> {
    try {
      const pipeline: any[] = [
        {
          $lookup: {
            from: "tutordocs",
            localField: "_id",
            foreignField: "tutorId",
            as: "verificationDocs",
          },
        },
      ];

      if (verificationStatus) {
        pipeline.push({
          $match: {
            "verificationDocs.verificationStatus": verificationStatus,
          },
        });
      }

      return await TutorModel.aggregate(pipeline).exec();
    } catch (error) {
      console.error("Error finding tutors with verification status:", error);
      throw error;
    }
  }

  async getTutorVerificationSummary(tutorId: string): Promise<any> {
    try {
      const pipeline = [
        {
          $match: { _id: tutorId },
        },
        {
          $lookup: {
            from: "tutordocs",
            localField: "_id",
            foreignField: "tutorId",
            as: "verificationDocs",
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            isVerified: 1,
            verificationStatus: {
              $cond: {
                if: { $eq: [{ $size: "$verificationDocs" }, 0] },
                then: "not_submitted",
                else: {
                  $arrayElemAt: ["$verificationDocs.verificationStatus", 0],
                },
              },
            },
            submittedAt: { $arrayElemAt: ["$verificationDocs.submittedAt", 0] },
            reviewedAt: { $arrayElemAt: ["$verificationDocs.reviewedAt", 0] },
          },
        },
      ];

      const result = await TutorModel.aggregate(pipeline).exec();
      return result[0] || null;
    } catch (error) {
      console.error("Error getting tutor verification summary:", error);
      throw error;
    }
  }
  async findAllListedTutors(): Promise<Tutor[]> {
    try {
      return await this.findWithCondition({
        isVerified: true,
        isBlocked: false,
      });
    } catch (error) {
      throw new Error(`Failed to find listed tutors: ${error}`);
    }
  }
}
