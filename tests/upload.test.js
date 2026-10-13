import "./env.js";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import { uploadBuffer, deleteImage } from "../utils/cloudinaryUpload.js";

let server;
let baseUrl;

// Test server that exercises the actual Multer middleware.
before(async () => {
  server = http.createServer((req, res) => {
    const handler =
      req.url === "/multiple"
        ? upload.array("images", 5)
        : upload.single("image");

    handler(req, res, (err) => {
      if (err) {
        res.writeHead(err.statusCode || 400, {
          "Content-Type": "application/json",
        });

        return res.end(
          JSON.stringify({
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
          }),
        );
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          file: req.file
            ? {
                mimetype: req.file.mimetype,
                size: req.file.size,
                hasBuffer: Buffer.isBuffer(req.file.buffer),
              }
            : undefined,
          files: req.files?.map((file) => ({
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: Buffer.isBuffer(file.buffer),
          })),
        }),
      );
    });
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

// Helper for sending files using multipart/form-data.
async function sendFiles(files, multiple = false) {
  const form = new FormData();

  for (const file of files) {
    form.append(
      multiple ? "images" : "image",
      new Blob([file.content], { type: file.type }),
      file.name,
    );
  }

  const response = await fetch(
    `${baseUrl}${multiple ? "/multiple" : "/single"}`,
    {
      method: "POST",
      body: form,
    },
  );

  return {
    status: response.status,
    body: await response.json(),
  };
}

function makeFile(name, type, size = 100) {
  return {
    name,
    type,
    content: Buffer.alloc(size, "a"),
  };
}

// multer tests

test("accepts JPEG images", async () => {
  const result = await sendFiles([makeFile("product.jpg", "image/jpeg")]);

  assert.equal(result.status, 200);
  assert.equal(result.body.file.mimetype, "image/jpeg");
  assert.equal(result.body.file.hasBuffer, true);
});

test("accepts PNG images", async () => {
  const result = await sendFiles([makeFile("product.png", "image/png")]);

  assert.equal(result.status, 200);
  assert.equal(result.body.file.mimetype, "image/png");
});

test("accepts WebP images", async () => {
  const result = await sendFiles([makeFile("product.webp", "image/webp")]);

  assert.equal(result.status, 200);
  assert.equal(result.body.file.mimetype, "image/webp");
});

test("rejects unsupported file types", async () => {
  const result = await sendFiles([makeFile("document.pdf", "application/pdf")]);

  assert.equal(result.status, 400);
  assert.equal(
    result.body.message,
    "Only jpg, png and webp images are allowed",
  );
  assert.equal(result.body.statusCode, 400);
});

test("rejects files larger than 5 MiB", async () => {
  const result = await sendFiles([
    makeFile("large.jpg", "image/jpeg", 5 * 1024 * 1024 + 1),
  ]);

  assert.equal(result.status, 400);
  assert.equal(result.body.code, "LIMIT_FILE_SIZE");
});

test("accepts exactly five files", async () => {
  const files = Array.from({ length: 5 }, (_, index) =>
    makeFile(`product-${index}.jpg`, "image/jpeg"),
  );

  const result = await sendFiles(files, true);

  assert.equal(result.status, 200);
  assert.equal(result.body.files.length, 5);
});

test("rejects more than five files", async () => {
  const files = Array.from({ length: 6 }, (_, index) =>
    makeFile(`product-${index}.jpg`, "image/jpeg"),
  );

  const result = await sendFiles(files, true);

  assert.equal(result.status, 400);
  assert.equal(result.body.code, "LIMIT_FILE_COUNT");
});

//cloudinary tests

test("uploadBuffer returns the secure URL and public ID", async (t) => {
  const expectedResult = {
    secure_url: "https://example.com/product.jpg",
    public_id: "shopcore/products/product_123",
  };

  let receivedOptions;
  let receivedBuffer;

  t.mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    receivedOptions = options;

    return {
      end(buffer) {
        receivedBuffer = buffer;
        callback(null, expectedResult);
      },
    };
  });

  const buffer = Buffer.from("fake image data");
  const result = await uploadBuffer(buffer);

  assert.deepEqual(result, {
    url: expectedResult.secure_url,
    publicId: expectedResult.public_id,
  });

  assert.equal(receivedOptions.folder, "shopcore/products");
  assert.equal(receivedOptions.resource_type, "image");
  assert.equal(receivedBuffer, buffer);
});

test("uploadBuffer supports a custom Cloudinary folder", async (t) => {
  let receivedOptions;

  t.mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    receivedOptions = options;

    return {
      end() {
        callback(null, {
          secure_url: "https://example.com/category.jpg",
          public_id: "shopcore/categories/category_123",
        });
      },
    };
  });

  await uploadBuffer(Buffer.from("fake image data"), "shopcore/categories");

  assert.equal(receivedOptions.folder, "shopcore/categories");
});

test("uploadBuffer rejects when Cloudinary upload fails", async (t) => {
  const uploadError = new Error("Cloudinary upload failed");

  t.mock.method(cloudinary.uploader, "upload_stream", (_options, callback) => ({
    end() {
      callback(uploadError, undefined);
    },
  }));

  await assert.rejects(
    uploadBuffer(Buffer.from("fake image data")),
    (error) => {
      assert.equal(error, uploadError);
      return true;
    },
  );
});

test("deleteImage calls Cloudinary with the correct public ID", async (t) => {
  const publicId = "ShopCore/products/product_123";
  const expectedResponse = { result: "ok" };

  const destroyMock = t.mock.method(
    cloudinary.uploader,
    "destroy",
    async () => expectedResponse,
  );

  const result = await deleteImage(publicId);

  assert.deepEqual(result, expectedResponse);
  assert.equal(destroyMock.mock.calls.length, 1);
  assert.deepEqual(destroyMock.mock.calls[0].arguments, [publicId]);
});
