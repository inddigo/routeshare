const fs = require('fs');
let schema = fs.readFileSync('database/schema.sql', 'utf8');

// Replace CREATE TABLE with CREATE TABLE IF NOT EXISTS
schema = schema.replace(/CREATE TABLE public\./g, 'CREATE TABLE IF NOT EXISTS public.');

// Replace CREATE INDEX with CREATE INDEX IF NOT EXISTS
schema = schema.replace(/CREATE INDEX (?!IF NOT EXISTS)/g, 'CREATE INDEX IF NOT EXISTS ');

// Safely handle CREATE POLICY
schema = schema.replace(/CREATE POLICY "([^"]+)" ON public\.([a-zA-Z0-9_]+)/g, 'DROP POLICY IF EXISTS "$1" ON public.$2;\nCREATE POLICY "$1" ON public.$2');

// Write out the safe schema
fs.writeFileSync('database/schema_safe.sql', schema);
console.log('Safe schema generated.');
