import { Model, Document, PopulateOptions } from "mongoose";
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
    limit: number,
    populateOptions?: PopulateOptions[]
  ): Promise<T[]> {
    let query = this._model.find(filter).skip(skip).limit(limit);

    if (populateOptions) {
      for (const pop of populateOptions) {
        query = query.populate(pop);
      }
    }

    return query.exec();
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
  async findWithConditionAndPopulate(
    condition: object,
    populateOptions?: PopulateOptions[]
  ): Promise<T[]> {
    let query = this._model.find(condition);

    if (populateOptions) {
      for (const pop of populateOptions) {
        query = query.populate(pop);
      }
    }

    return query.exec();
  }

  async findOneAndPopulate(
    condition: object,
    populateOptions?: PopulateOptions[]
  ): Promise<T | null> {
    let query = this._model.findOne(condition);

    if (populateOptions) {
      for (const pop of populateOptions) {
        query = query.populate(pop);
      }
    }

    return query.exec();
  }

  async findWithFiltersAndSort(
    filter: object,
    skip: number,
    limit: number,
    sortOptions?: any,
    populateOptions?: PopulateOptions[]
  ): Promise<T[]> {
    let query = this._model.find(filter).skip(skip).limit(limit);

    if (sortOptions) {
      query = query.sort(sortOptions);
    }

    if (populateOptions) {
      for (const pop of populateOptions) {
        query = query.populate(pop);
      }
    }

    return query.exec();
  }

  async findWithConditionPopulateAndSort(
    condition: object,
    populateOptions?: PopulateOptions[],
    sortObject?: any
  ): Promise<T[]> {
    let query = this._model.find(condition);

    if (populateOptions) {
      for (const pop of populateOptions) {
        query = query.populate(pop);
      }
    }

    if (sortObject) {
      query = query.sort(sortObject);
    }

    return query.exec();
  }
}

export default BaseRepository;
