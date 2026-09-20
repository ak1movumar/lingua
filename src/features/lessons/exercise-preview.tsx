'use client';
import { messages as copy } from '@/i18n/exercise-preview';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Badge, Card, ProgressBar } from '@/components/ui/surface';
import { ThemeSwitcher, LanguageSwitcher } from '@/components/ui/preferences';
import { TextExercise } from './text-exercise';
import { ChoiceExercise, MatchExercise } from './visual-exercises';
import styles from './lesson.module.scss';
import visual from './visual-exercises.module.scss';
const types = ['choice', 'match', 'translate', 'fill_gap'] as const;
export function ExercisePreview() {
  const {
    locale,
    messages: { learning: t },
  } = useI18n();
  const c = copy[locale];
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState('');
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<boolean | null>(null);
  const reset = (next: number) => {
    setStep(next);
    setAnswer('');
    setSelected('');
    setPairs({});
    setResult(null);
  };
  const left = [
    { id: 'hello', text: 'hello' },
    { id: 'water', text: 'water' },
    { id: 'book', text: 'book' },
  ];
  const right = [
    { id: 'book', text: locale === 'ky' ? 'китеп' : 'книга' },
    { id: 'hello', text: locale === 'ky' ? 'салам' : 'привет' },
    { id: 'water', text: locale === 'ky' ? 'суу' : 'вода' },
  ];
  const question = [c.choice, c.match, c.translate, c.gap][step];
  const canCheck =
    step === 1 ? Object.keys(pairs).length === 3 : !!answer.trim();
  const check = () =>
    setResult(
      step === 0
        ? answer === 'apple'
        : step === 1
          ? left.every((item) => pairs[item.id] === item.id)
          : step === 2
            ? ['thank you', 'thanks'].includes(
                answer.trim().toLowerCase().replace(/[.!]$/, ''),
              )
            : answer.trim().toLowerCase() === 'am',
    );
  return (
    <main id="main-content" className={styles.workspace}>
      <header className={visual.previewHeader}>
        <LinkButton href="/courses" variant="ghost">
          {c.back}
        </LinkButton>
        <Badge tone="primary">A1</Badge>
        <Badge>{c.preview}</Badge>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </header>
      <div className={styles.exercise}>
        <p className={visual.note}>{c.note}</p>
        <nav className={visual.tabs} aria-label={c.title}>
          {types.map((type, index) => (
            <Button
              key={type}
              size="sm"
              variant={step === index ? 'primary' : 'secondary'}
              aria-pressed={step === index}
              onClick={() => reset(index)}
            >
              {t[type]}
            </Button>
          ))}
        </nav>
        <ProgressBar value={(step / 4) * 100} label={t.sessionProgress} />
        {step === 4 ? (
          <Card className={styles.complete}>
            <CheckCircle2 size={48} />
            <h1>{c.done}</h1>
            <p>{c.doneHint}</p>
            <Button onClick={() => reset(0)}>
              <RotateCcw size={18} />
              {c.again}
            </Button>
          </Card>
        ) : (
          <section aria-labelledby="preview-question">
            <h1 id="preview-question">{question}</h1>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (result === true) reset(step + 1);
                else if (canCheck) check();
              }}
            >
              {step === 0 ? (
                <ChoiceExercise
                  label={c.pick}
                  options={[
                    { id: 'bread', text: 'Bread' },
                    { id: 'apple', text: 'Apple' },
                    { id: 'milk', text: 'Milk' },
                    { id: 'orange', text: 'Orange' },
                  ]}
                  value={answer}
                  onChange={(value) => {
                    setAnswer(value);
                    setResult(null);
                  }}
                  disabled={result === true}
                />
              ) : step === 1 ? (
                <MatchExercise
                  left={left}
                  right={right}
                  selected={selected}
                  pairs={pairs}
                  onSelect={setSelected}
                  onPair={(id) => {
                    if (!selected) return;
                    setPairs({ ...pairs, [selected]: id });
                    setSelected('');
                    setResult(null);
                  }}
                  onRemove={(id) => {
                    const next = { ...pairs };
                    delete next[id];
                    setPairs(next);
                    setResult(null);
                  }}
                  disabled={result === true}
                  label={c.pair}
                  removeLabel={c.remove}
                />
              ) : (
                <TextExercise
                  answer={answer}
                  onChange={(value) => {
                    setAnswer(value);
                    setResult(null);
                  }}
                  disabled={result === true}
                />
              )}
              <div aria-live="polite">
                {result !== null && (
                  <div className={result ? styles.correct : styles.error}>
                    <strong>{result ? t.correct : t.incorrect}</strong>
                    {!result && (
                      <span>
                        {c.hint}{' '}
                        {step === 0
                          ? 'Apple'
                          : step === 1
                            ? c.matchHint
                            : step === 2
                              ? 'Thank you'
                              : 'am'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <footer className={styles.controls}>
                <Button type="submit" size="lg" disabled={!canCheck}>
                  {result === true
                    ? step === 3
                      ? t.finish
                      : t.nextExercise
                    : t.check}
                  <ArrowRight size={18} />
                </Button>
              </footer>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
