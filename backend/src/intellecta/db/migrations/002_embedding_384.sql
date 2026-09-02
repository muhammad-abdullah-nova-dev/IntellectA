-- Resize embedding column for FastEmbed BAAI/bge-small-en-v1.5 (384 dims)
-- Safe when document_chunks is empty or you are re-seeding.

DROP INDEX IF EXISTS idx_chunks_embedding;

ALTER TABLE document_chunks
    ALTER COLUMN embedding TYPE vector(384);

CREATE INDEX idx_chunks_embedding ON document_chunks
    USING hnsw (embedding vector_cosine_ops);
