// Проверка датасета: npm run check.
// Загружает TypeScript-файлы данных через Vite (runnerImport) и запускает validateQuestions.
import { runnerImport } from 'vite';

const { module: data } = await runnerImport('/src/data/questions/index.ts');
const { module: v } = await runnerImport('/src/data/validate.ts');
const { QUESTIONS } = data;

const errors = v.validateQuestions(QUESTIONS);
const byType = {};
const byDiff = { 1: 0, 2: 0, 3: 0 };
for (const q of QUESTIONS) {
  byType[q.type] = (byType[q.type] ?? 0) + 1;
  byDiff[q.difficulty]++;
}
console.log(`Вопросов: ${QUESTIONS.length}`);
console.log('По режимам:', byType);
console.log('По сложности (1/2/3):', byDiff);
if (errors.length) {
  console.error('\nОшибки в данных:\n' + errors.map((e) => ' • ' + e).join('\n'));
  process.exit(1);
}
console.log('✓ Данные в порядке');
