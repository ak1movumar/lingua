'use client';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  MessageCircle,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import { Logo } from '@/components/layout/logo';
import { LinkButton } from '@/components/ui/link-button';
import { Card } from '@/components/ui/surface';
import { PublicHeader } from './public-header';
import { LanguageArt } from './language-art';
import { CatalogPreview } from './catalog-preview';
import { LearningExperience, ProgressPreview } from './experience';
import styles from './landing.module.scss';
export function LandingPage() {
  const {
    messages: { landing: t },
  } = useI18n();
  const benefits = [
    { Icon: Compass, title: t.benefitOne, body: t.benefitOneBody },
    { Icon: BookOpen, title: t.benefitTwo, body: t.benefitTwoBody },
    { Icon: UsersRound, title: t.benefitThree, body: t.benefitThreeBody },
  ];
  const steps = [
    { title: t.stepOne, body: t.stepOneBody },
    { title: t.stepTwo, body: t.stepTwoBody },
    { title: t.stepThree, body: t.stepThreeBody },
  ];
  return (
    <div className={styles.page}>
      <PublicHeader />
      <main id="main-content">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span />
              {t.eyebrow}
            </p>
            <h1>{t.heroTitle}</h1>
            <p className={styles.heroDescription}>{t.heroDescription}</p>
            <div className={styles.heroActions}>
              <LinkButton href="/register">
                {t.start}
                <ArrowRight size={18} />
              </LinkButton>
              <LinkButton href="#courses" variant="secondary">
                {t.explore}
                <ArrowUpRight size={17} />
              </LinkButton>
            </div>
            <p className={styles.heroNote}>
              <Sparkles size={15} />
              {t.heroNote}
            </p>
          </div>
          <LanguageArt />
        </section>
        <div className={styles.heroDivider}>
          <span />
          <p>{t.journeyLabel}</p>
          <span />
        </div>
        <section id="features" className={styles.section}>
          <div className={styles.centerHeading}>
            <p className={styles.eyebrow}>{t.features}</p>
            <h2>{t.benefitsTitle}</h2>
          </div>
          <div className={styles.benefits}>
            {benefits.map(({ Icon, title, body }, index) => (
              <Card key={title}>
                <div className={styles.benefitIcon} data-tone={index}>
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </Card>
            ))}
          </div>
        </section>
        <CatalogPreview />
        <section className={styles.section}>
          <div className={styles.centerHeading}>
            <p className={styles.eyebrow}>{t.howLabel}</p>
            <h2>{t.howTitle}</h2>
          </div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>
        <LearningExperience />
        <ProgressPreview />
        <section id="community" className={styles.community}>
          <div className={styles.communityArt} aria-hidden="true">
            <span>Hola!</span>
            <span>Салам!</span>
            <span>Hello!</span>
            <div>
              <MessageCircle size={66} strokeWidth={1} />
            </div>
            <i />
            <b />
          </div>
          <div>
            <p className={styles.eyebrow}>{t.communityLabel}</p>
            <h2>{t.communityTitle}</h2>
            <p>{t.communityBody}</p>
            <LinkButton href="/register">
              {t.join}
              <ArrowRight size={17} />
            </LinkButton>
            <small>{t.communityNote}</small>
          </div>
        </section>
        <section id="about" className={styles.about}>
          <p className={styles.eyebrow}>{t.about}</p>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutBody}</p>
        </section>
        <section className={styles.cta}>
          <Sparkles size={26} />
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <LinkButton href="/register">
            {t.start}
            <ArrowRight size={18} />
          </LinkButton>
        </section>
      </main>
<footer className={styles.footer}>
  <div className={styles.footerBrand}>
    <Logo />
    <p>{t.footer}</p>
  </div>

  <nav className={styles.footerLinks} aria-label={t.about}>
    <a href="#features">{t.features}</a>
    <a href="#courses">{t.courses}</a>
    <a href="#community">{t.community}</a>
  </nav>

  <div className={styles.footerBottom}>
    <span>© {new Date().getFullYear()} Lingua</span>

    <span>
      Разработано{' '}
      <a href="/" target="_blank" rel="noopener noreferrer">
        Motion Community
      </a>
    </span>
  </div>
</footer>
    </div>
  );
}
