const express = require("express");
const request = require("supertest");
const friendService = require("./friend.service");
const friendcontroller = require("./friend.controller");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { expressAuthMiddleware } = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../../config/redis");

jest.mock("./friend.service");

const app = express();
app.use(express.json());

beforeAll(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  tokenPayload = { id: "507f191e810c19729de860ea", email: "test@example.com" };
  token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
  await redisClient.set(`token:${tokenPayload.id}`, token);
}, 10000);

afterAll(async () => {
  await redisClient.del(`token:${tokenPayload.id}`); // ล้าง token ที่ใช้ทดสอบ
  await redisClient.quit(); // ปิด redis connection
},10000);

//add
app.post("/api/friend/add", expressAuthMiddleware, friendcontroller.add);
describe("Friend add API", () => {
  it("should send friend request successfully", async () => {
    friendService.addService.mockResolvedValue({ message: "Request sent" });

    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Request sent");
  });

  it("should return 400 if targetId missing", async () => {
    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if Send request to yourself", async () => {
    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f191e810c19729de860ea" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Cannot send request to yourself"
    );
  });

  it("should return 500 if friend list not found", async () => {
    friendService.addService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend list not found");
  });

  it("should return 500 if Already friends", async () => {
    friendService.addService.mockImplementation(() => {
      throw new Error("Already friends");
    });

    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Already friends");
  });

  it("should return 500 if Friend request already sent", async () => {
    friendService.addService.mockImplementation(() => {
      throw new Error("Friend request already sent");
    });

    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend request already sent");
  });

  it("should return 500 if Friend request already received", async () => {
    friendService.addService.mockImplementation(() => {
      throw new Error("Friend request already received");
    });

    const res = await request(app)
      .post("/api/friend/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend request already received");
  });
});
//remove
app.post("/api/friend/remove", expressAuthMiddleware, friendcontroller.remove);
describe("Friend remove API", () => {
  it("should remove friend successfully", async () => {
    friendService.removeService.mockResolvedValue({
      message: "Friend removed",
    });

    const res = await request(app)
      .post("/api/friend/remove")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Friend removed");
  });

  it("should return 400 if remove targetId missing", async () => {
    const res = await request(app)
      .post("/api/friend/remove")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if try to remove yourself", async () => {
    const res = await request(app)
      .post("/api/friend/remove")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f191e810c19729de860ea" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Cannot remove friend on yourself"
    );
  });

  it("should return 500 if remove friend list not found", async () => {
    friendService.removeService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/remove")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend list not found");
  });

  it("should return 500 if users were not friends", async () => {
    friendService.removeService.mockImplementation(() => {
      throw new Error("users were not friends");
    });

    const res = await request(app)
      .post("/api/friend/remove")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("users were not friends");
  });
});

//accept
app.post("/api/friend/accept", expressAuthMiddleware, friendcontroller.accept);
describe("Friend accept API", () => {
  it("should accept friend successfully", async () => {
    friendService.acceptService.mockResolvedValue({
      message: "Friend request accepted",
    });

    const res = await request(app)
      .post("/api/friend/accept")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Friend request accepted");
  });

  it("should return 400 if accept requesterId missing", async () => {
    const res = await request(app)
      .post("/api/friend/accept")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if try to accept yourself", async () => {
    const res = await request(app)
      .post("/api/friend/accept")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f191e810c19729de860ea" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Cannot accept request on yourself"
    );
  });

  it("should return 500 if accept friend list not found", async () => {
    friendService.acceptService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/accept")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend list not found");
  });
});

//decline
app.post("/api/friend/decline", expressAuthMiddleware, friendcontroller.decline);
describe("Friend decline API", () => {
  it("should decline friend successfully", async () => {
    friendService.declineService.mockResolvedValue({
      message: "Friend request declined",
    });

    const res = await request(app)
      .post("/api/friend/decline")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Friend request declined");
  });

  it("should return 400 if declined requesterId missing", async () => {
    const res = await request(app)
      .post("/api/friend/decline")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if try to decline yourself", async () => {
    const res = await request(app)
      .post("/api/friend/decline")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f191e810c19729de860ea" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Cannot decline request on yourself"
    );
  });

  it("should return 500 if decline friend list not found", async () => {
    friendService.declineService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/decline")
      .set("Authorization", `Bearer ${token}`)
      .send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend list not found");
  });
});