import { readFileSync } from 'node:fs';
import path from 'node:path';

/** Lê um arquivo do projeto (os testes rodam com a raiz do projeto como cwd). */
export function lerArquivo(relativo: string): string {
  return readFileSync(path.join(process.cwd(), relativo), 'utf8');
}
