import BaseRepository from '../BaseRepository';
import { ITutor, ITutorDocs } from '../../interfaces/tutorInterface/tutorInterface';
import { ITutorRepository } from '../../interfaces/tutor/tutorRepoInterface';
import { TutorDocs } from '../../models/TutorDocs';
import TutorModel from '../../models/Tutors';

export class TutorRepository extends BaseRepository<ITutor> implements ITutorRepository {
  private tutorDocsModel: typeof TutorDocs;

  constructor() {
    super(TutorModel); 
    this.tutorDocsModel = TutorDocs; 
  }


  async findTutorByEmailOrPhone(email?: string, phone?: string): Promise<ITutor | null> {
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

      return await this.findOne(query);
    } catch (error) {
      console.error('Error finding tutor by email or phone:', error);
      throw error;
    }
  }

  async findTutorById(tutorId: string): Promise<ITutor | null> {
    try {
      return await this.findOne({tutorId});
    } catch (error) {
      console.error('Error finding tutor by ID:', error);
      throw error;
    }
  }

  async createTutor(tutorData: Partial<ITutor>): Promise<ITutor> {
    try {
      return await this.create(tutorData as ITutor);
    } catch (error) {
      console.error('Error creating tutor:', error);
      throw error;
    }
  }

  async updateTutor(tutorId: string, updateData: Partial<ITutor>): Promise<ITutor | null> {
    try {
      return await this.update(tutorId, updateData);
    } catch (error) {
      console.error('Error updating tutor:', error);
      throw error;
    }
  }

  

  // ============================================================================
  // VERIFICATION DOCUMENTS OPERATIONS
  // ============================================================================

  async findVerificationDocsByTutorId(tutorId: string): Promise<ITutorDocs | null> {
    try {
      return await this.tutorDocsModel.findOne({ tutorId }).exec();
    } catch (error) {
      console.error('Error finding verification docs by tutor ID:', error);
      throw error;
    }
  }

  async createVerificationDocs(documentData: Partial<ITutorDocs>): Promise<ITutorDocs> {
    try {
      const verificationDocs = new this.tutorDocsModel(documentData);
      return await verificationDocs.save();
    } catch (error) {
      console.error('Error creating verification documents:', error);
      throw error;
    }
  }

  async updateVerificationDocs(docId: string, updateData: Partial<ITutorDocs>): Promise<ITutorDocs | null> {
    try {
      return await this.tutorDocsModel.findByIdAndUpdate(
        docId,
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      console.error('Error updating verification documents:', error);
      throw error;
    }
  }

  async findVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ITutorDocs[]> {
    try {
      return await this.tutorDocsModel.find({ verificationStatus: status }).exec();
    } catch (error) {
      console.error('Error finding verification docs by status:', error);
      throw error;
    }
  }

  async findVerificationDocsWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<ITutorDocs[]> {
    try {
      return await this.tutorDocsModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ submittedAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error finding verification docs with pagination:', error);
      throw error;
    }
  }

  async countVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<number> {
    try {
      return await this.tutorDocsModel.countDocuments({ verificationStatus: status }).exec();
    } catch (error) {
      console.error('Error counting verification docs by status:', error);
      throw error;
    }
  }

  async updateVerificationStatus(
    docId: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<ITutorDocs | null> {
    try {
      const updateData: Partial<ITutorDocs> = {
        verificationStatus: status,
        reviewedAt: new Date()
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      return await this.tutorDocsModel.findByIdAndUpdate(
        docId,
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  async findVerificationDocsWithTutorInfo(tutorId: string): Promise<any> {
    try {
      return await this.tutorDocsModel
        .findOne({ tutorId })
        .populate('tutorId', 'name email phone')
        .exec();
    } catch (error) {
      console.error('Error finding verification docs with tutor info:', error);
      throw error;
    }
  }

  async findAllVerificationDocsWithTutorInfo(): Promise<any[]> {
    try {
      return await this.tutorDocsModel
        .find()
        .populate('tutorId', 'name email phone')
        .sort({ submittedAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error finding all verification docs with tutor info:', error);
      throw error;
    }
  }


  async findTutorsWithVerificationStatus(
    verificationStatus?: 'pending' | 'approved' | 'rejected'
  ): Promise<any[]> {
    try {
      const pipeline: any[] = [
        {
          $lookup: {
            from: 'tutordocs', // Make sure this matches your TutorDocs collection name
            localField: '_id',
            foreignField: 'tutorId',
            as: 'verificationDocs'
          }
        }
      ];

      if (verificationStatus) {
        pipeline.push({
          $match: {
            'verificationDocs.verificationStatus': verificationStatus
          }
        });
      }

      return await TutorModel.aggregate(pipeline).exec();
    } catch (error) {
      console.error('Error finding tutors with verification status:', error);
      throw error;
    }
  }

  async getTutorVerificationSummary(tutorId: string): Promise<any> {
    try {
      const pipeline = [
        {
          $match: { _id: tutorId }
        },
        {
          $lookup: {
            from: 'tutordocs',
            localField: '_id',
            foreignField: 'tutorId',
            as: 'verificationDocs'
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
            isVerified: 1,
            verificationStatus: {
              $cond: {
                if: { $eq: [{ $size: '$verificationDocs' }, 0] },
                then: 'not_submitted',
                else: { $arrayElemAt: ['$verificationDocs.verificationStatus', 0] }
              }
            },
            submittedAt: { $arrayElemAt: ['$verificationDocs.submittedAt', 0] },
            reviewedAt: { $arrayElemAt: ['$verificationDocs.reviewedAt', 0] }
          }
        }
      ];

      const result = await TutorModel.aggregate(pipeline).exec();
      return result[0] || null;
    } catch (error) {
      console.error('Error getting tutor verification summary:', error);
      throw error;
    }
  }
}