import { describe, expect, test } from "bun:test";
import { validateQuery } from "../src/validation.js";

describe("read-only SQL validation", () => {
    test.each(["SELECT 1", "WITH value AS (SELECT 1) SELECT * FROM value", "EXPLAIN SELECT 1"])(
        "allows %s",
        (query) => expect(validateQuery(query).valid).toBe(true),
    );

    test.each(["INSERT INTO users VALUES (1)", "UPDATE users SET id = 2", "DELETE FROM users", "DROP TABLE users"])(
        "rejects %s",
        (query) => expect(validateQuery(query).valid).toBe(false),
    );
});
