import { useFlashMessage } from "@/composables/useFlashMessage";
import { api, apiUrl } from "@/services/api";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Query } from "./Query";

interface sorts {
  key: string;
  value: "asc" | "desc";
}
export interface Params {
  resourceId: null | number;
  includes: string[];
  sorts: string[];
  filters: Record<string, string | number>;
  page: number | null;
  perPage: number | null;
  limit: number | null;
  offset: number | null;
  relationship: Relationship | null;
}

interface Relationship {
  id: number;
  related: string;
}

export default class Rbuilder {
  static make(resource: String) {
    return new this(resource);
  }

  baseUrl = apiUrl;
  private api = api;
  private resource: String;

  private params = {
    resourceId: null as unknown as number,
    includes: [] as string[],
    sorts: [] as string[],
    filters: {} as Record<string, string | number>,
    page: <number>(<unknown>null),
    perPage: <number>(<unknown>null),
    limit: <number>(<unknown>null),
    offset: <number>(<unknown>null),
    relationship: <Relationship>(<unknown>null),
  } as Params;
  protected constructor(resource: String) {
    this.resource = resource;
    // if (params !== undefined) this.params = params;
  }
  // static q = () => new this();
  async create(data: unknown) {
    const res = await this.api.post(this.url(), data);
    return res;
  }
  async update(id: number, data: unknown) {
    this.params.resourceId = id;
    const res = api.put(this.url(), data);
    return res;
  }

  async delete(id: number) {
    this.params.resourceId = id;
    const res = api.delete(this.url());
    return res;
  }

  page(page: number) {
    if (typeof page == "number") {
      this.params.page = page;
    }
    return this;
  }

  perPage(count: number) {
    if (typeof count == "number") {
      this.params.perPage = count;
    }
    return this;
  }

  where(column: string, value: string | number) {
    if (column === undefined || value === undefined) {
      throw new Error(
        "The where() function takes 2 arguments both of string values."
      );
    }
    this.params.filters[column] = value;
    return this;
  }
  whereIn(column: string, values: string | number[]) {
    if (!column || !values) {
      throw new Error(
        "The whereIn() function takes 2 arguments of (string, array)."
      );
    }
    if ((!column && Array.isArray(column)) || typeof column === "object") {
      throw new Error(
        "The first argument for the whereIn() function must be a string or integer."
      );
    }
    if (!Array.isArray(values)) {
      throw new Error(
        "The second argument for the whereIn() function must be an array."
      );
    }
    this.params.filters[column] = values.join(",");
    return this;
  }
  with(models: string[]) {
    if (!models.length) {
      throw new Error(`The with() function takes at least one argument.`);
    }
    this.params.includes.push(...models);

    return this;
  }
  async find(id: number) {
    this.params.resourceId = id;
    return await this.get();
  }
  async get() {
    try {
      return await (
        await this.api.get(this.url())
      ).data;
    } catch (error) {
      throw error;
    }
  }
  async all() {
    return (await this.api.get(`${this.baseUrl}/${this.resource}`)).data;
  }
  from(related: string, id: number) {
    this.params.relationship = { id, related };
    return this;
  }
  orderBy(field: string, order: "asc" | "desc") {
    const sort = order == "asc" ? `${field}` : `-${field}`;
    this.params.sorts.push(sort);
    return this;
  }
  limit(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error(
        "The limit() function takes a single argument of a number."
      );
    }
    this.params.limit = value;
    return this;
  }
  offset(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error(
        "The limit() function takes a single argument of a number."
      );
    }
    this.params.offset = value;
    return this;
  }

  path() {
    return this.params.relationship == null
      ? `/${this.resource}${
          this.params.resourceId ? "/" + this.params.resourceId : ""
        }`
      : `/${this.params.relationship.related}/${this.params.relationship.id}/${this.resource}`;
  }
  parsePath() {
    if (!this.resource) {
      throw new Error("Please set the resource type for your model");
    }
    return `${this.path()}?${this.parseQuery()}`;
  }
  parseQuery() {
    const query = new Query(this.params);
    return query.parse();
  }
  url() {
    const url = this.baseUrl
      ? this.baseUrl + this.parsePath()
      : this.parsePath();
    // reset the url so the query object can be re-used
    return url;
  }

  // handleErrors = (error: unknown) => {
  //   if (error) {
  //     const err = error as AxiosResponse;
  //     const flash = useFlashMessage();
  //     const data = err.data;
  //     const title = data.message;
  //     const errors = data.errors;
  //     let id = 1;
  //     for (const errorKey in errors) {
  //       ++id;
  //       let message = "";
  //       for (const error of errors[errorKey]) {
  //         message += ` ${error}`;
  //       }
  //       flash.showFlash({ title, message, type: "error", id }, 5000);
  //     }
  //   }
  // };
}
