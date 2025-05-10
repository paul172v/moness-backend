import request from "supertest";
import app from "../src/app";

describe("Test /test route", () => {
  it("should return status 200 and a success message", async () => {
    const res = await request(app).get("/test");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});
