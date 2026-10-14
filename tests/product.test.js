
import test from "node:test";
import assert from "node:assert/strict";
import {
  paginate,
  paginationMeta,
} from "../utils/paginate.js";

test("uses sensible defaults when pagination is omitted", () => {
  assert.deepEqual(paginate({}), {
    page: 1,
    limit: 10,
    skip: 0,
  });
});

test("calculates the offset for page two", () => {
  assert.deepEqual(paginate({ page: "2", limit: "10" }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
});

test("prevents negative pages and caps the limit", () => {
  assert.deepEqual(paginate({ page: "-1", limit: "500" }), {
    page: 1,
    limit: 100,
    skip: 0,
  });
});

test("calculates pagination metadata", () => {
  assert.deepEqual(paginationMeta(2, 10, 25), {
    page: 2,
    limit: 10,
    total: 25,
    totalPages: 3,
  });
});
