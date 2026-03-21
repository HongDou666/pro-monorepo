import { describe, it, expect } from "vitest";
import {
  base64Encode,
  base64Decode,
  xorEncrypt,
  xorDecrypt,
  generateKey,
  aesEncrypt,
  aesDecrypt,
  sha256,
  sha512,
  md5
} from "../src/crypto";

describe("Crypto Utils", () => {
  describe("base64Encode / base64Decode", () => {
    it("应该能够正确编码和解码字符串", () => {
      const original = "Hello, World! 你好世界";
      const encoded = base64Encode(original);
      const decoded = base64Decode(encoded);

      expect(decoded).toBe(original);
    });

    it("编码空字符串应该返回空字符串", () => {
      expect(base64Encode("")).toBe("");
    });

    it("解码无效字符串应该返回空字符串", () => {
      expect(base64Decode("!!!invalid!!!")).toBe("");
    });
  });

  describe("xorEncrypt / xorDecrypt", () => {
    it("应该能够正确加密和解密字符串", () => {
      const original = "Hello, World!";
      const key = "secret-key";
      const encrypted = xorEncrypt(original, key);
      const decrypted = xorDecrypt(encrypted, key);

      expect(decrypted).toBe(original);
    });

    it("没有密钥时应该返回原字符串", () => {
      const original = "test-string";

      expect(xorEncrypt(original, "")).toBe(original);
      expect(xorDecrypt(original, "")).toBe(original);
    });

    it("不同密钥加密结果应该不同", () => {
      const original = "Hello";
      const encrypted1 = xorEncrypt(original, "key1");
      const encrypted2 = xorEncrypt(original, "key2");

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe("generateKey", () => {
    it("应该生成指定长度的密钥", () => {
      const key16 = generateKey(16);
      const key32 = generateKey(32);

      expect(key16.length).toBe(16);
      expect(key32.length).toBe(32);
    });

    it("默认应该生成 16 位密钥", () => {
      const key = generateKey();

      expect(key.length).toBe(16);
    });

    it("多次生成的密钥应该不同", () => {
      const key1 = generateKey();
      const key2 = generateKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe("aesEncrypt / aesDecrypt", () => {
    it("应该能够正确加密和解密字符串", async () => {
      const original = "Hello, World! 你好世界";
      const password = "my-password";
      const encrypted = await aesEncrypt(original, password);
      const decrypted = await aesDecrypt(encrypted, password);

      expect(decrypted).toBe(original);
    });

    it("不同密码加密结果应该不同", async () => {
      const original = "Hello";
      const encrypted1 = await aesEncrypt(original, "password1");
      const encrypted2 = await aesEncrypt(original, "password2");

      expect(encrypted1).not.toBe(encrypted2);
    });

    it("错误密码解密应该返回空字符串", async () => {
      const original = "Hello";
      const encrypted = await aesEncrypt(original, "correct-password");
      const decrypted = await aesDecrypt(encrypted, "wrong-password");

      expect(decrypted).toBe("");
    });
  });

  describe("sha256", () => {
    it("应该生成正确的 SHA-256 哈希值", async () => {
      const hash = await sha256("hello");

      // "hello" 的 SHA-256 哈希值
      expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    });

    it("不同输入应该产生不同哈希值", async () => {
      const hash1 = await sha256("hello");
      const hash2 = await sha256("world");

      expect(hash1).not.toBe(hash2);
    });

    it("相同输入应该产生相同哈希值", async () => {
      const hash1 = await sha256("test");
      const hash2 = await sha256("test");

      expect(hash1).toBe(hash2);
    });
  });

  describe("sha512", () => {
    it("应该生成 128 字符的 SHA-512 哈希值", async () => {
      const hash = await sha512("hello");

      expect(hash.length).toBe(128);
    });

    it("不同输入应该产生不同哈希值", async () => {
      const hash1 = await sha512("hello");
      const hash2 = await sha512("world");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("md5", () => {
    it("应该生成正确的 MD5 哈希值", () => {
      const hash = md5("hello");

      // "hello" 的 MD5 哈希值
      expect(hash).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("应该生成 32 字符的哈希值", () => {
      const hash = md5("test");

      expect(hash.length).toBe(32);
    });

    it("不同输入应该产生不同哈希值", () => {
      const hash1 = md5("hello");
      const hash2 = md5("world");

      expect(hash1).not.toBe(hash2);
    });

    it("相同输入应该产生相同哈希值", () => {
      const hash1 = md5("test");
      const hash2 = md5("test");

      expect(hash1).toBe(hash2);
    });
  });
});
