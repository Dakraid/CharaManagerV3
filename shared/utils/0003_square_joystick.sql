ALTER TABLE "definitions" ADD COLUMN "hash" text GENERATED ALWAYS AS (encode(digest(content #>> '{}', 'sha256'), 'hex')) STORED;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION HASH_CONTENT (CONTENT TEXT) RETURNS TEXT AS $$
	DECLARE output TEXT;
BEGIN
SELECT (encode(digest(CONTENT, 'sha256'), 'hex')) INTO output;
RETURN output;
END;
$$ LANGUAGE PLPGSQL;