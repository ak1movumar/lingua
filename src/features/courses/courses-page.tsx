'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/providers/i18n-provider';
import { PageHeader } from '@/components/ui/surface';
import { SearchInput, Select } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { placementMessages } from '@/i18n/placement';
import { EmptyState } from '@/components/ui/states';
import { LearningShell } from '@/features/learning/learning-shell';
import {
  LearningError,
  LearningSkeleton,
} from '@/features/learning/data-state';
import {
  coursesOptions,
  languagesOptions,
  useProgress,
} from '@/features/learning/queries';
import { CourseCard } from './course-card';
import { courseSchema } from './catalog-api';
import styles from '@/features/learning/learning.module.scss';
export function CoursesPage() {
  const {
    locale,
    messages: { learning: t },
  } = useI18n();
  const courses = useQuery(coursesOptions());
  const languages = useQuery(languagesOptions());
  const progress = useProgress();
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const filtered = (courses.data ?? [])
    .filter(
      (course) =>
        (!language || course.language_id === Number(language)) &&
        (!level || course.level === level) &&
        (course.title + ' ' + course.description)
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase().trim()),
    )
    .sort((a, b) => a.order - b.order || a.id - b.id);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages);
  const reset = () => {
    setSearch('');
    setLanguage('');
    setLevel('');
    setPage(1);
  };
  return (
    <LearningShell active="courses">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.catalog}
        description={t.catalogHint}
        action={
          <LinkButton href="/learning-path">
            {placementMessages[locale].title}
          </LinkButton>
        }
      />
      <div className={styles.filters}>
        <SearchInput
          label={t.search}
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          label={t.language}
          value={language}
          disabled={!languages.data}
          onChange={(event) => {
            setLanguage(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{t.allLanguages}</option>
          {languages.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select
          label={t.level}
          value={level}
          onChange={(event) => {
            setLevel(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{t.allLevels}</option>
          {courseSchema.shape.level.options.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
      </div>
      <p className={styles.helper}>{t.filterHint}</p>
      {(progress.isError || languages.isError) && (
        <p role="status" className={styles.notice}>
          {t.partialError}
        </p>
      )}
      {courses.isPending ? (
        <LearningSkeleton />
      ) : courses.isError ? (
        <LearningError onRetry={() => void courses.refetch()} />
      ) : !courses.data.length ? (
        <EmptyState title={t.noCourses} description={t.noCoursesHint} />
      ) : !filtered.length ? (
        <EmptyState
          title={t.noResults}
          description={t.noResultsHint}
          action={
            <Button variant="secondary" onClick={reset}>
              {t.reset}
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.courseGrid}>
            {filtered
              .slice((currentPage - 1) * 6, currentPage * 6)
              .map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  language={
                    languages.data?.find(
                      (language) => language.id === course.language_id,
                    )?.name
                  }
                  progress={progress.data}
                />
              ))}
          </div>
          {pages > 1 && (
            <nav className={styles.pagination} aria-label={t.page}>
              <Button
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                {t.previous}
              </Button>
              <span>
                {currentPage} {t.of} {pages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= pages}
                onClick={() => setPage(currentPage + 1)}
              >
                {t.next}
              </Button>
            </nav>
          )}
        </>
      )}
    </LearningShell>
  );
}
