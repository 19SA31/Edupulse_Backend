import { Model, Document } from "mongoose";
class BaseRepository<T extends Document> {
  private _model: Model<T>;
  constructor(model: Model<T>) {
    this._model = model;
  }

  async create(data: T): Promise<T> {
    const document = new this._model(data);
    return document.save();
  }
  async findOne(condition: object): Promise<T | null> {
    return this._model.findOne(condition).exec();
  }
  async findAll(): Promise<T[]> {
    return this._model.find().exec();
  }
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this._model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  async delete(id: string): Promise<T | null> {
    return this._model.findByIdAndDelete(id).exec();
  }
  async findWithCondition(condition: object): Promise<T[]> {
    return this._model.find(condition).exec();
  }
  async findWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<T[]> {
    return this._model.find(filter).skip(skip).limit(limit).exec();
  }
  async countDocuments(filter: object): Promise<number> {
    return this._model.countDocuments(filter).exec();
  }
  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this._model.aggregate(pipeline);
    } catch (error: any) {
      console.error("Error in BaseRepository aggregate:", error.message);
      throw error;
    }
  }
}

export default BaseRepository;
