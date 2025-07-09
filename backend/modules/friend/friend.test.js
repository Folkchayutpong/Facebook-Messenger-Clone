const express = require("express");
const request = require("supertest");
const friendService = require("./friend.service");
const friendcontroller = require("./friend.controller");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


jest.mock("./friend.service");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: "507f191e810c19729de860ea" };
  next();
});

//add
app.post("/api/friend/add", friendcontroller.add);
describe("Friend add API with mocked user", () => {
  it("should send friend request successfully", async () => {
    friendService.addService.mockResolvedValue({ message: "Request sent" });

    const res = await request(app).post("/api/friend/add").send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Request sent");
  });

  it("should return 400 if targetId missing", async () => {
    const res = await request(app).post("/api/friend/add").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if Send request to yourself", async () => {
    const res = await request(app).post("/api/friend/add").send({targetId: "507f191e810c19729de860ea"});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message","Cannot send request to yourself");
  });

  it("should return 500 if friend list not found", async () => {
    friendService.addService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/add")
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
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend request already received");
  });
});
//remove
app.post("/api/friend/remove", friendcontroller.remove);
describe("Friend remove API with mocked user", () => {
  it("should remove friend successfully", async () => {
    friendService.removeService.mockResolvedValue({ message: "Friend removed" });

    const res = await request(app).post("/api/friend/remove").send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Friend removed");
  });

  it("should return 400 if remove targetId missing", async () => {
    const res = await request(app).post("/api/friend/remove").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if try to remove yourself", async () => {
    const res = await request(app).post("/api/friend/remove").send({targetId: "507f191e810c19729de860ea"});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message","Cannot remove friend on yourself");
  });

  it("should return 500 if remove friend list not found", async () => {
    friendService.removeService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/remove")
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
      .send({ targetId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("users were not friends");
  });

});

//accept
app.post("/api/friend/accept", friendcontroller.accept);
describe("Friend accept API with mocked user", () => {
  it("should accept friend successfully", async () => {
    friendService.acceptService.mockResolvedValue({ message: "Friend request accepted" });

    const res = await request(app).post("/api/friend/accept").send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Friend request accepted");
  });

  it("should return 400 if accept requesterId missing", async () => {
    const res = await request(app).post("/api/friend/accept").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing target user ID");
  });

  it("should return 400 if try to accept yourself", async () => {
    const res = await request(app).post("/api/friend/accept").send({requesterId: "507f191e810c19729de860ea"});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message","Cannot accept request on yourself");
  });

  it("should return 500 if accept friend list not found", async () => {
    friendService.acceptService.mockImplementation(() => {
      throw new Error("Friend list not found");
    });

    const res = await request(app)
      .post("/api/friend/accept")
      .send({ requesterId: "507f1f77bcf86cd799439011" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Friend list not found");
  });
})

