const request = require("supertest");
const chatController = require("./chat.controller");
const chatService = require("./chat.service");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../../config/redis");

jest.mock("./chat.service");

const tokenPayload = {
  id: "507f191e810c19729de860ea",
  email: "test@example.com",
};

beforeAll(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
  await redisClient.set(`token:${tokenPayload.id}`, token);
}, 10000);

afterAll(async () => {
  await redisClient.del(`token:${tokenPayload.id}`);
  await redisClient.quit();
}, 10000);

describe("POST /api/chats", () => {
  it("should create group chat successfully", async () => {
    const req = {
      body: {
        name: "Test Group Chat",
        members: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockChat = {
      name: "Test Group Chat",
      members: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      type: "group",
      admins: ["507f191e810c19729de860ea"],
    };

    chatService.createGroupChatService.mockResolvedValue(mockChat);

    await chatController.CreateGroupChat(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Group chat created successfully",
      data: mockChat,
    });
  });

  it("should return 400 if name is missing", async () => {
    const req = {
      body: {
        members: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await chatController.CreateGroupChat(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing or invalid fields",
    });
  });

  it("should return 400 if members is less than 2", async () => {
    const req = {
      body: {
        name: "Test Group Chat",
        members: ["507f191e810c19729de860ea"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await chatController.CreateGroupChat(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Group chat must have at least 2 unique members",
    });
  });

  it("should return 400 if members is more than 10", async () => {
    const req = {
      body: {
        name: "Test Group Chat",
        members: [
          "507f191e810c19729de860ea",
          "507f191e810c19729de860eb",
          "507f191e810c19729de860ec",
          "507f191e810c19729de860ed",
          "507f191e810c19729de860ee",
          "507f191e810c19729de860ef",
          "507f191e810c19729de860f0",
          "507f191e810c19729de860f1",
          "507f191e810c19729de860f2",
          "507f191e810c19729de860f3",
          "507f191e810c19729de860f4",
        ],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await chatController.CreateGroupChat(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Group chat can have a maximum of 10 members",
    });
  });

  it("should return 500 if failed to create group chat", async () => {
    const req = {
      body: {
        name: "Test Group Chat",
        members: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.createGroupChatService.mockRejectedValue(new Error("Error"));

    await chatController.CreateGroupChat(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error" });
  });
});

describe("GET api/chats", () => {
  it("should get all group chats successfully", async () => {
    const req = {
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockChats = [
      {
        _id: "507f191e810c19729de860ea",
        name: "Test Group Chat",
        members: ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
        admins: ["507f191e810c19729de860ea"],
      },
    ];

    chatService.getChatsService.mockResolvedValue(mockChats);

    await chatController.GetChats(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockChats);
  });

  it("should return 500 if failed to get group chats", async () => {
    const req = {
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.getChatsService.mockRejectedValue(new Error("Error"));

    await chatController.GetChats(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error" });
  });
});

describe("UPDATE api/chats/:id", () => {
  it("should update chat successfully", async () => {
    const req = {
      params: { id: "chatId" },
      body: {
        newName: "Updated Chat Name",
        add_Members: ["507f191e810c19729de860eb"],
        remove_Members: ["507f191e810c19729de860ec"],
        add_Admin: ["507f191e810c19729de860ed"],
        remove_Admin: ["507f191e810c19729de860ee"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin.mockResolvedValue(true);
    chatService.renameChat.mockResolvedValue();
    chatService.addMembers.mockResolvedValue();
    chatService.removeMembers.mockResolvedValue();
    chatService.addAdmins.mockResolvedValue();
    chatService.removeAdmins.mockResolvedValue();

    await chatController.UpdateChat(req, res);

    expect(chatService.checkAdmin).toHaveBeenCalledWith("chatId", req.user.id);
    expect(chatService.renameChat).toHaveBeenCalledWith(
      "chatId",
      req.body.newName
    );
    expect(chatService.addMembers).toHaveBeenCalledWith(
      "chatId",
      req.body.add_Members
    );
    expect(chatService.removeMembers).toHaveBeenCalledWith(
      "chatId",
      req.body.remove_Members
    );
    expect(chatService.addAdmins).toHaveBeenCalledWith(
      "chatId",
      req.body.add_Admin
    );
    expect(chatService.removeAdmins).toHaveBeenCalledWith(
      "chatId",
      req.body.remove_Admin
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Chat updated successfully",
    });
  });

  it("should return 400 if missing chat id", async () => {
    const req = {
      params: {},
      body: {
        newName: "Updated Chat Name",
        add_Members: ["507f191e810c19729de860eb"],
        remove_Members: ["507f191e810c19729de860ec"],
        add_Admin: ["507f191e810c19729de860ed"],
        remove_Admin: ["507f191e810c19729de860ee"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await chatController.UpdateChat(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing chat ID" });
  });

  it("should return 403 if user is not admin", async () => {
    const req = {
      params: { id: "chatId" },
      body: {
        newName: "Updated Chat Name",
        add_Members: ["507f191e810c19729de860eb"],
        remove_Members: ["507f191e810c19729de860ec"],
        add_Admin: ["507f191e810c19729de860ed"],
        remove_Admin: ["507f191e810c19729de860ee"],
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin.mockResolvedValue(false);
    await chatController.UpdateChat(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not an admin" });
  });

  it("should return 500 if update failed", async () => {
    const req = {
      params: { id: "chatId" },
      body: {
        newName: "Updated Chat Name",
      },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin = jest.fn().mockResolvedValue(true);
    chatService.renameChat = jest
      .fn()
      .mockRejectedValue(new Error("Failed to update chat"));

    await chatController.UpdateChat(req, res);

    expect(chatService.checkAdmin).toHaveBeenCalledWith("chatId", req.user.id);
    expect(chatService.renameChat).toHaveBeenCalledWith(
      "chatId",
      "Updated Chat Name"
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to update chat" });
  });
});

describe("DELETE api/chats/:id", () => {
  it("should delete chat successfully", async () => {
    const req = {
      params: { id: "chatId" },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin.mockResolvedValue(true);
    chatService.deleteChat.mockResolvedValue("Chat deleted successfully");
    await chatController.DeleteChat(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("Chat deleted successfully");
  });

  it("should return 403 if user is not admin", async () => {
    const req = {
      params: { id: "chatId" },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin.mockResolvedValue(false);
    await chatController.DeleteChat(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not an admin" });
  });

  it("should return 500 if delete failed", async () => {
    const req = {
      params: { id: "chatId" },
      user: { id: "507f191e810c19729de860ea" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    chatService.checkAdmin = jest.fn().mockResolvedValue(true);
    chatService.deleteChat = jest
      .fn()
      .mockRejectedValue(new Error("Failed to delete chat"));

    await chatController.DeleteChat(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete chat" });
  });
});
