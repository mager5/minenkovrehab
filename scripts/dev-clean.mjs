import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
 
const paths = ['.next', '.next 2', 'node_modules/.cache'].map(p =>
  resolve(process.cwd(), p)
);
 
await Promise.all(
  paths.map(p =>
    rm(p, {
      recursive: true,
      force: true,
    })
  )
);
