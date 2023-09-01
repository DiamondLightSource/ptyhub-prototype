export default class Job {
  jobId: string;

  accessToken: string;

  constructor(jobId: string, accessToken: string) {
    this.jobId = jobId;
    this.accessToken = accessToken;
  }

  static fromJSON(json: string): Job {
    const data = JSON.parse(json);
    return new Job(data.jobId, data.accessToken);
  }

  toJSON(): string {
    return JSON.stringify({
      jobId: this.jobId,
      accessToken: this.accessToken,
    });
  }
}
