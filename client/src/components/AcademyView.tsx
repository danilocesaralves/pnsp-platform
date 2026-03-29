import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Play, Lock, BookOpen, Users, Clock, Star, ChevronRight, CheckCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Course = {
  id: number; slug: string; title: string; description?: string | null;
  category: string; level: string; instructorName?: string | null;
  durationMinutes?: number | null; price: number; isFree?: boolean | null;
  enrollmentsCount: number;
};
type Lesson = {
  id: number; order: number; title: string; durationMinutes?: number | null;
  isFree?: boolean | null;
};
type Enrollment = { id: number; progress: number; courseId: number; enrolledAt: string | Date };

// ─── CategoryBadge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    historia: "var(--ouro)", tecnica: "var(--verde)", instrumentos: "#e55",
    composicao: "#7c5cbf", producao: "#4a9eff", carreira: "var(--ouro)",
    negocios: "var(--verde)", cultura: "#e55",
  };
  const color = colors[category] ?? "var(--creme-50)";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: color + "22", color }}>
      {category}
    </span>
  );
}

// ─── LevelBadge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: string }) {
  const labels: Record<string, string> = {
    iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado",
  };
  const colors: Record<string, string> = {
    iniciante: "var(--verde)", intermediario: "var(--ouro)", avancado: "#e55",
  };
  const color = colors[level] ?? "var(--creme-50)";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + "22", color }}>
      {labels[level] ?? level}
    </span>
  );
}

// ─── LessonItem ───────────────────────────────────────────────────────────────
function LessonItem({ lesson, isEnrolled }: { lesson: Lesson; isEnrolled: boolean }) {
  const accessible = isEnrolled || lesson.isFree;
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--n900)" }}>
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {accessible
          ? <Play size={12} style={{ color: "var(--ouro)" }} />
          : <Lock size={12} style={{ color: "var(--creme-50)" }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: accessible ? "var(--creme)" : "var(--creme-50)" }}>
          {lesson.order}. {lesson.title}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {lesson.isFree && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--verde)22", color: "var(--verde)" }}>Grátis</span>
        )}
        {lesson.durationMinutes && (
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--creme-50)" }}>
            <Clock size={10} />{lesson.durationMinutes}min
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CourseCard ───────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition-opacity hover:opacity-90"
      style={{ background: "var(--terra)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--ouro)22" }}
        >
          <BookOpen size={22} style={{ color: "var(--ouro)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--creme)" }}>{course.title}</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <CategoryBadge category={course.category} />
            <LevelBadge level={course.level} />
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--creme-50)" }}>
            <span className="flex items-center gap-1"><Users size={10} />{course.enrollmentsCount} alunos</span>
            {course.durationMinutes && (
              <span className="flex items-center gap-1"><Clock size={10} />{Math.round(course.durationMinutes / 60)}h</span>
            )}
            <span className="ml-auto font-bold" style={{ color: course.isFree ? "var(--verde)" : "var(--ouro)" }}>
              {course.isFree ? "Grátis" : `R$ ${(course.price / 100).toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: "var(--creme-50)", flexShrink: 0 }} />
      </div>
    </button>
  );
}

// ─── CourseDetail ─────────────────────────────────────────────────────────────
function CourseDetail({
  courseId,
  myProfileId,
  onBack,
}: {
  courseId: number;
  myProfileId?: number;
  onBack: () => void;
}) {
  const courseQ = trpc.academy.getCourseById.useQuery({ id: courseId });
  const enrollmentsQ = trpc.academy.getMyEnrollments.useQuery(
    { profileId: myProfileId ?? 0 },
    { enabled: !!myProfileId },
  );

  const enroll = trpc.academy.enroll.useMutation({
    onSuccess: () => {
      toast.success("Matriculado com sucesso!");
      enrollmentsQ.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const course = courseQ.data;
  const lessons = (courseQ.data as any)?.lessons as Lesson[] ?? [];
  const isEnrolled = enrollmentsQ.data?.some((e) => e.enrollment.courseId === courseId) ?? false;
  const enrollment = enrollmentsQ.data?.find((e) => e.enrollment.courseId === courseId);

  if (!course) {
    return <div className="text-center py-8" style={{ color: "var(--creme-50)" }}>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm flex items-center gap-1" style={{ color: "var(--ouro)" }}>
        ← Voltar
      </button>

      <div className="rounded-2xl p-5" style={{ background: "var(--terra)" }}>
        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryBadge category={course.category} />
          <LevelBadge level={course.level} />
        </div>
        <h2 className="text-xl font-display font-bold mb-2" style={{ color: "var(--creme)" }}>{course.title}</h2>
        {course.description && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--creme-50)" }}>{course.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: "var(--creme-50)" }}>
          {course.instructorName && (
            <span className="flex items-center gap-1"><Star size={14} style={{ color: "var(--ouro)" }} />{course.instructorName}</span>
          )}
          <span className="flex items-center gap-1"><Users size={14} />{course.enrollmentsCount} alunos</span>
          {course.durationMinutes && <span className="flex items-center gap-1"><Clock size={14} />{course.durationMinutes}min</span>}
        </div>

        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: "var(--verde)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--verde)" }}>Matriculado</span>
              <span className="ml-auto text-sm" style={{ color: "var(--creme-50)" }}>
                {enrollment?.enrollment.progress ?? 0}% concluído
              </span>
            </div>
            <div className="rounded-full h-2 overflow-hidden" style={{ background: "var(--n900)" }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${enrollment?.enrollment.progress ?? 0}%`, background: "var(--verde)" }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => myProfileId && enroll.mutate({ courseId, profileId: myProfileId })}
            disabled={!myProfileId || enroll.isPending}
            className="pnsp-btn-primary w-full flex items-center justify-center gap-2"
          >
            <Play size={16} />
            {enroll.isPending ? "Matriculando..." : course.isFree ? "Começar Grátis" : `Matricular — R$ ${(course.price / 100).toFixed(2).replace(".", ",")}`}
          </button>
        )}
      </div>

      {/* Lessons */}
      {lessons.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2" style={{ color: "var(--creme)" }}>Aulas ({lessons.length})</h3>
          <div className="space-y-1">
            {lessons.map((lesson) => (
              <LessonItem key={lesson.id} lesson={lesson} isEnrolled={isEnrolled} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AcademyView (default export) ─────────────────────────────────────────────
export default function AcademyView({ myProfileId }: { myProfileId?: number }) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const coursesQ = trpc.academy.getCourses.useQuery({
    category: categoryFilter,
    level: levelFilter,
    isFree: showFreeOnly ? true : undefined,
    limit: 20,
  });

  const courses = coursesQ.data ?? [];

  if (selectedCourseId !== null) {
    return (
      <CourseDetail
        courseId={selectedCourseId}
        myProfileId={myProfileId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  const categories = ["historia", "tecnica", "instrumentos", "composicao", "producao", "carreira", "negocios", "cultura"];
  const levels = ["iniciante", "intermediario", "avancado"];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter(undefined)}
            className="text-xs px-3 py-1 rounded-full font-semibold transition-colors"
            style={{ background: !categoryFilter ? "var(--ouro)" : "var(--terra)", color: !categoryFilter ? "#0A0800" : "var(--creme-50)" }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? undefined : cat)}
              className="text-xs px-3 py-1 rounded-full font-semibold capitalize transition-colors"
              style={{ background: categoryFilter === cat ? "var(--ouro)" : "var(--terra)", color: categoryFilter === cat ? "#0A0800" : "var(--creme-50)" }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(levelFilter === lvl ? undefined : lvl)}
              className="text-xs px-3 py-1 rounded-full font-semibold capitalize transition-colors"
              style={{ background: levelFilter === lvl ? "var(--ouro)" : "var(--terra)", color: levelFilter === lvl ? "#0A0800" : "var(--creme-50)" }}
            >
              {lvl}
            </button>
          ))}
          <button
            onClick={() => setShowFreeOnly(!showFreeOnly)}
            className="text-xs px-3 py-1 rounded-full font-semibold transition-colors"
            style={{ background: showFreeOnly ? "var(--verde)" : "var(--terra)", color: showFreeOnly ? "#0A0800" : "var(--creme-50)" }}
          >
            Gratuito
          </button>
        </div>
      </div>

      {/* Courses */}
      {coursesQ.isLoading ? (
        <div className="text-center py-8 text-sm" style={{ color: "var(--creme-50)" }}>Carregando cursos...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-sm" style={{ color: "var(--creme-50)" }}>
          Nenhum curso encontrado com esses filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onClick={() => setSelectedCourseId(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
